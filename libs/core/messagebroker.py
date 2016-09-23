import dill as pickle
import pika
from libs.core.configs import read_messagebroker_configs
from threading import Thread

confs = read_messagebroker_configs()

RABBITMQ_HOST = confs['RABBITMQ_HOST']
RABBITMQ_PORT = confs['RABBITMQ_PORT']
EXCHANGE_CORE = confs['EXCHANGE_CORE']
EXCHANGE_CONTROLLERS = confs['EXCHANGE_CONTROLLERS']


class MessageBroker(object):
    """
    MessageBroker allows the core and the controllers to exchange messages through RabbitMQ. First, it's necessary
    to create a callback method, which will be called every time a message arrives. This method must receive a single
    argument, the message being received. MessageBroker's constructor receives two arguments: the callback method and
    a boolean, indicating if it is a controller (defaults to True, a controller, if set to False, it will be the core).
    After creation, it will start waiting for incoming messages after start_receiving method is called, and will stop
    waiting for messages after stop_receiving is called.
    To send a message, simple call send_message passing the message as an argument.
    All messages are serialized using pickle, so it is possible to send any kind of object as message.
    """
    def __init__(self, callback, controller=True):
        self.callback = callback
        if controller:
            self.exchange_receive = EXCHANGE_CONTROLLERS
            self.exchange_send = EXCHANGE_CORE
        else:
            self.exchange_receive = EXCHANGE_CORE
            self.exchange_send = EXCHANGE_CONTROLLERS
        self.receive_thread = None
        self.channel = None
        self.conn = None
        self.queue_name = None

    def start_receiving(self):
        """
        Creates and starts thread to listen for incoming messages, if needed
        Returns:

        """
        if self.receive_thread:
            return

        def connect():
            self.conn = pika.BlockingConnection(pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                port=RABBITMQ_PORT
            ))

        def get_channel():
            self.channel = self.conn.channel()
            self.channel.exchange_declare(exchange=self.exchange_receive, type='fanout')
            result = self.channel.queue_declare(exclusive=True)
            self.queue_name = result.method.queue
            self.channel.queue_bind(exchange=self.exchange_receive, queue=self.queue_name)

        connect()
        get_channel()

        def listener():
            # Method that will be run by the thread to listen for incoming messages
            while True:
                try:
                    for method_frame, properties, body in self.channel.consume(self.queue_name):
                        if self.receive_thread is None:  # Test if the thread should be stopped
                            self.conn.close()
                            break
                        msg = pickle.loads(body)
                        self.callback(msg)  # Calls the method the user passed to treat the message
                except (pika.exceptions.ConnectionClosed, pika.exceptions.ChannelClosed):
                    while True:
                        try:
                            connect()
                        except pika.exceptions.ConnectionClosed:
                            pass
                        else:
                            break
                    get_channel()
                else:
                    break

        self.receive_thread = Thread(target=listener)
        self.receive_thread.start()

    def stop_receiving(self):
        """
        Cancel the thread that receives messages
        Returns:

        """
        if self.receive_thread:
            self.receive_thread = None
            # The test at the listener method is executed only after receiving a message, so we need to send a fake
            # message, that will never be treated.
            self._send_finish_message()

    def _send_finish_message(self):
        """
        Sends a fake message allowing the thread to be stopped
        Returns:

        """
        conn = pika.BlockingConnection(pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            port=RABBITMQ_PORT
        ))
        channel = conn.channel()
        channel.basic_publish(exchange='', routing_key=self.queue_name, body='')
        conn.close()

    def send_message(self, msg):
        """

        Args:
            msg: The message to be sent

        Returns:
            None

        """
        conn = pika.BlockingConnection(pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            port=RABBITMQ_PORT
        ))
        channel = conn.channel()
        channel.exchange_declare(exchange=self.exchange_send, type='fanout')
        serialized = pickle.dumps(msg)

        channel.basic_publish(exchange=self.exchange_send, routing_key='', body=serialized)
        conn.close()