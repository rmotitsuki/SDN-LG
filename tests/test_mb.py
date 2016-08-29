import pika, dill as pickle
import unittest
from libs.core.messagebroker import send_message


class TestMessageBroker(unittest.TestCase):

    def test_send(self):
        conn = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        channel = conn.channel()
        channel.exchange_declare(exchange='controllers', type='fanout')
        result = channel.queue_declare(exclusive=True)
        queue_name = result.method.queue
        channel.queue_bind(exchange='controllers', queue=queue_name)
        sent_msg = 'Testing message!'
        send_message(sent_msg, 'controllers')
        for method_frame, properties, body in channel.consume(queue_name):
            msg = pickle.loads(body)
            self.assertEqual(msg, sent_msg)
            break

        conn.close()

if __name__ == '__main__':
    unittest.main()