import pika, dill as pickle
import unittest
from libs.core.messagebroker import send_message


class TestMessageBroker(unittest.TestCase):

    def setUp(self):
        self.conn = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        self.channel = self.conn.channel()
        self.channel.exchange_declare(exchange='controllers', type='fanout')
        result = self.channel.queue_declare(exclusive=True)
        self.queue_name = result.method.queue
        self.channel.queue_bind(exchange='controllers', queue=self.queue_name)

    def tearDown(self):
        self.conn.close()

    def test_send_one_string(self):
        sent_msg = 'Testing message!'
        send_message(sent_msg, 'controllers')
        for method_frame, properties, body in self.channel.consume(self.queue_name):
            msg = pickle.loads(body)
            self.assertEqual(msg, sent_msg)
            break

    def test_send_two_messages(self):
        sent_msg = ['Testing message 1!', {'first': 'Test 1', 'second': ('now', 'a', 'tuple'), 'third': 3}]
        send_message(sent_msg[0], 'controllers')
        send_message(sent_msg[1])
        counter = 0
        for method_frame, properties, body in self.channel.consume(self.queue_name):
            msg = pickle.loads(body)
            self.assertEqual(msg, sent_msg[counter])
            counter += 1
            if counter > 1:
                break


if __name__ == '__main__':
    unittest.main()
