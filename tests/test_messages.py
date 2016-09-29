# import dill as pickle
# import unittest, sys
# from libs.cal.messages import Message, InvalidMessageError, IncorrectBodyError
# import libs
#
#
# class TestMessages(unittest.TestCase):
#
#     def setUp(self):
#         self.message1 = Message(0, 0, {'request_id': 1, 'ip': '10.0.0.2'})
#
#     def test_messages(self):
#         self.assertEqual(self.message1.payloads(), "Start - ID Negotiation")
#         with self.assertRaises(IncorrectBodyError):
#             Message(0, 0, {'request_id': 1, 'zip': '10.0.0.2'})
#
# if __name__ == '__main__':
#     unittest.main()
