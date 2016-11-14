import unittest
from libs.cal.message import Message
from libs.cal.cal import CoreCal


class TestFullNegotiation(unittest.TestCase):

    def setUp(self):
        ipp = "1.1.1.1:1"
        s_id = {"suggested_id": 1}
        self.msg = {
                    "header":
                        {"version": 1, "id": 1, "payload": 1, "timing": 1, "ipp": ipp},
                    "body": s_id
                    }

        self.message = Message(self.msg)
        self.core = CoreCal()

    def test_valid_negotiation(self):

        # Establishing connecting with Ctrl A
        # A sends the first packet
        # C generates a confirmation and sends back to A
        ipp_a = "1.1.1.1:1"
        s_id_a = {"suggested_id": 1}
        from_ctrl_a = {"header": {"version": 1, "id": 0, "payload": 0, "timing": 1, "ipp": ipp_a}, "body": s_id_a}
        self.assertTrue(Message(from_ctrl_a))

        ipp_c = '192.168.56.3:6111'
        s_id_c = s_id_a
        answer = {"header": {"version": 1, "id": 255, "payload": 1, "timing": 100, "ipp": ipp_c}, "body": s_id_c}
        self.core.process_incoming_message(from_ctrl_a)
        self.assertEqual(self.core.for_unittest, answer)

        # A sends the confirmation
        # C has to compare - variable self.core.for_unittest
        s_id_a = s_id_c
        my_id = s_id_c['suggested_id']
        from_ctrl_a = {"header": {"version": 1, "id": my_id, "payload": 1, "timing": 1, "ipp": ipp_a}, "body": s_id_a}
        self.assertTrue(Message(from_ctrl_a))
        self.core.process_incoming_message(from_ctrl_a)
        self.assertEqual(self.core.for_unittest, True)
        self.assertEqual((len(self.core.table_id) == 1 and self.core.table_id[1]['status'] == 'Assigned'), True)

        # Establishing connecting with Ctrl B
        ipp_b = "3.3.3.3:3"
        s_id_b = {"suggested_id": 1}
        from_ctrl_b = {"header": {"version": 1, "id": 0, "payload": 0, "timing": 1, "ipp": ipp_b}, "body": s_id_b}
        self.assertTrue(Message(from_ctrl_a))
        ipp_c = '192.168.56.3:6111'
        s_id_c = {"suggested_id": 2}
        answer = {"header": {"version": 1, "id": 255, "payload": 2, "timing": 100, "ipp": ipp_c}, "body": s_id_c}
        self.core.process_incoming_message(from_ctrl_b)
        self.assertEqual(self.core.for_unittest, answer)
        self.assertEqual((len(self.core.table_id) == 2 and self.core.table_id[2]['status'] == 'Reserved'), True)

if __name__ == '__main__':
    unittest.main()
