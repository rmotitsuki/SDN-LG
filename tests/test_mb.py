import dill as pickle
import unittest, sys
from libs.core.messagebroker import MessageBroker


class Message(object):
    def __init__(self, v1, v2, v3):
        self.variable1 = v1
        self.variable2 = v2
        self.variable3 = v3

    def __eq__(self, msg):
        return self.variable1 == msg.variable1 and self.variable2 == msg.variable2 and self.variable3 == msg.variable3


class TestMessageBroker(unittest.TestCase):

    def setUp(self):
        self.core_messages = []
        self.controller1_messages = []
        self.controller2_messages = []

        def listener_core(msg):
            self.core_messages.append(msg)

        def listener_controller1(msg):
            self.controller1_messages.append(msg)

        def listener_controller2(msg):
            self.controller2_messages.append(msg)

        self.core = MessageBroker(listener_core, False)
        self.controller1 = MessageBroker(listener_controller1)
        self.controller2 = MessageBroker(listener_controller2)

    def test_various_consumers(self):
        # Message 1 is sent only to first controller (second has not started receiving yet)
        # Messages 2 and 3 are sent to both controllers
        # Message 4 is sent only to second controller (first has stopped receiving)
        # Messages 5 and 6 are sent to the core
        self.core.start_receiving()
        self.controller1.start_receiving()

        self.core.send_message('Message 1!')

        self.controller2.start_receiving()
        self.core.send_message({'first': 'Test 1', 'second': ('now', 'a', 'tuple'), 'third': 3})
        message = Message(1, 56.7, ('a', 'b'))
        self.core.send_message(message)

        self.controller1.stop_receiving()
        self.core.send_message('Message 4!')

        self.controller2.send_message('Message 5!')
        self.controller1.send_message('Message 6!')

        self.core.stop_receiving()
        self.controller2.stop_receiving()

        self.assertEqual(self.core_messages, ['Message 5!', 'Message 6!'])
        self.assertEqual(self.controller1_messages,
                         ['Message 1!', {'first': 'Test 1', 'second': ('now', 'a', 'tuple'), 'third': 3}, message])
        self.assertEqual(self.controller2_messages,
                         [{'first': 'Test 1', 'second': ('now', 'a', 'tuple'), 'third': 3}, message, 'Message 4!'])

    def test_one_consumer(self):
        self.controller1.start_receiving()

        self.core.send_message('Message 1!')
        self.core.send_message('Message 2!')
        self.core.send_message('Message 3!')

        self.controller1.stop_receiving()
        self.core.send_message('Message 4!')
        self.core.send_message('Message 5!')

        self.controller1.start_receiving()
        self.core.send_message('Message 6!')
        self.core.send_message('Message 7!')

        self.controller1.stop_receiving()

        self.assertEqual(self.controller1_messages,
                         ['Message 1!', 'Message 2!', 'Message 3!', 'Message 6!', 'Message 7!'])


if __name__ == '__main__':
    unittest.main()
