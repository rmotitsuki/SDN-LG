"""
    Instalation on Debian
    ERLANG most updated:
    wget https://packages.erlang-solutions.com/erlang/esl-erlang/FLAVOUR_1_general/esl-erlang_19.0.2-1~debian~jessie_amd64.deb
    apt-get install libwxbase2.8-0 libwxgtk2.8-0 libgtk2.0-0 libgtk2.0-bin libgtk2.0-common
    apt-get install rabbitmq-server

"""
import pika


class MessagePublisher(object):
    """
        Main publisher
    """

    def __init__(self, amqp):
        self.queue_exists = False
        self.host = amqp['RMQ_HOST']
        self.exchange_name = amqp['RMQ_QUEUE']
        self.routing_key = 'hello'

    def publish(self, message):
        """
            Publish to queue 'to_sdnlg_local_controllers'
        """
        conn = pika.AsyncoreConnection(pika.ConnectionParameters(self.host))

        ch = conn.channel()

        ch.exchange_declare(exchange=self.exchange_name, type="fanout", durable=True, auto_delete=False)

        ch.basic_publish(exchange=self.exchange_name,
                         routing_key=self.routing_key,
                         body=message,
                         properties=pika.BasicProperties(
                                content_type = "text/plain",
                                delivery_mode = 2, # persistent
                                ),
                         block_on_flow_control = True)
        ch.close()
        conn.close()

    def monitor(self, qname, callback):
        """
            Receive from queue 'from_sdnlg_main_controller'
        """
        conn = pika.AsyncoreConnection(pika.ConnectionParameters(self.host))

        ch = conn.channel()

        if not self.queue_exists:
            ch.queue_declare(queue=qname, durable=True, exclusive=False, auto_delete=False)
            ch.queue_bind(queue=qname, exchange=self.exchange_name)
            print("Binding queue %s to exchange %s" % (qname, self.exchange_name))
            self.queue_exists = True

        ch.basic_consume(callback, queue=qname)

        pika.asyncore_loop()
        print('Close reason: %s' % conn.connection_close)