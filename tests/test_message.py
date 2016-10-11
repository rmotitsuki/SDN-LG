import unittest
# from mock import Mock
from libs.cal.message import Message
from libs.cal.cal import CoreCal


class TestMessageHeader(unittest.TestCase):

    # Test message.header.version
    def test_wrong_versions(self):
        msg_recv = {"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"}}
        my_msg_recv = msg_recv
        values = [0, 'a', -1, ""]
        for value in values:
            my_msg_recv['header']['version'] = value
            self.message = Message(my_msg_recv)
            self.assertEqual(self.message.validate_header(), False)
            del self.message

    def test_right_versions(self):
        msg_recv = {"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"}}
        my_msg_recv = msg_recv
        values = [1, '1']
        for value in values:
            my_msg_recv['header']['version'] = value
            self.message = Message(my_msg_recv)
            self.assertEqual(self.message.validate_header(), True)
            del self.message

    # Test message.header.id
    def test_wrong_ids(self):
        msg_recv = {"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"}}
        my_msg_recv = msg_recv
        values = [256, 'a', -1, ""]
        for value in values:
            my_msg_recv['header']['id'] = value
            self.message = Message(my_msg_recv)
            self.assertEqual(self.message.validate_header(), False)
            del self.message

    def test_right_ids(self):
        msg_recv = {"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"}}
        my_msg_recv = msg_recv
        values = [0, 1, '1']
        for value in values:
            my_msg_recv['header']['id'] = value
            self.message = Message(my_msg_recv)
            self.assertEqual(self.message.validate_header(), True)
            del self.message

    # Test message.header.payload
    def test_wrong_payloads(self):
        msg_recv = {"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"}}
        my_msg_recv = msg_recv
        values = [256, 'a', -1, ""]
        for value in values:
            my_msg_recv['header']['payload'] = value
            self.message = Message(my_msg_recv)
            self.assertEqual(self.message.validate_header(), False)
            del self.message

    def test_right_payloads(self):
        msg_recv = {"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"}}
        my_msg_recv = msg_recv
        values = [0, 1, '1']
        for value in values:
            my_msg_recv['header']['payload'] = value
            self.message = Message(my_msg_recv)
            self.assertEqual(self.message.validate_header(), True)
            del self.message

    # Test message.header.timing
    def test_wrong_timings(self):
        msg_recv = {"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"}}
        my_msg_recv = msg_recv
        values = ['a', -1, ""]
        for value in values:
            my_msg_recv['header']['timing'] = value
            self.message = Message(my_msg_recv)
            self.assertEqual(self.message.validate_header(), False)
            del self.message

    def test_right_timings(self):
        msg_recv = {"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"}}
        my_msg_recv = msg_recv
        values = [0, 1, '1']
        for value in values:
            my_msg_recv['header']['timing'] = value
            self.message = Message(my_msg_recv)
            self.assertEqual(self.message.validate_header(), True)
            del self.message

    # Test message.header.ipp
    def test_wrong_ipps(self):
        msg_recv = {"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"}}
        my_msg_recv = msg_recv
        values = [256, 'a', -1, "", "0.0.1.0:100000", "12.4.2:2222", "255.255.255:65535", "12.4.2.22"]
        for value in values:
            my_msg_recv['header']['ipp'] = value
            self.message = Message(my_msg_recv)
            self.assertEqual(self.message.validate_header(), False)
            del self.message

    def test_right_ipp(self):
        msg_recv = {"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"}}
        self.my_msg_recv = msg_recv
        values = ["0.0.1.0:1", "12.12.4.2:2222", "255.255.255.255:65535"]
        for value in values:
            self.my_msg_recv['header']['ipp'] = value
            self.message = Message(self.my_msg_recv)
            self.assertEqual(self.message.validate_header(), True)
            del self.message
        print msg_recv


class TestMessageBody(unittest.TestCase):

    def setUp(self):
        my_msg_recv = msg_recv

    # For default payload = 0, Test message.body.suggested_id
    def test_wrong_suggested_ids(self):
        self.message = Message()
        values = [0, 'a', -1, "", 256]
        for value in values:
            my_msg_recv['body']['suggested_id'] = value
            self.assertEqual(self.message.validate_body(my_msg_recv['body']), False)

    def test_rigt_suggested_ids(self):
        self.message = Message()
        values = [1, '1', 100, 255]
        for value in values:
            my_msg_recv['body']['suggested_id'] = value
            self.assertEqual(self.message.validate_body(my_msg_recv['body']), True)

    # For payload = 3, Test actions
    def test_wrong_actions(self):
        self.message = Message(payload=3)
        values = [0, 'a', -1, "", 256]
        for value in values:
            my_msg_recv['body']['action'] = value
            self.message.body.action = value
            self.assertEqual(self.message.validate_body(my_msg_recv['body']), False)

    def test_right_actions(self):
        self.message = Message(payload=3)
        values = ['switch_config', 'error', 'msg_received', 'entry_removed',
                  'add_entry', 'get_statistics', 'send_probe']
        for value in values:
            self.message.body.action = value
            my_msg_recv['body']['action'] = value
            self.assertEqual(self.message.validate_body(my_msg_recv['body']), True)


class TestFullMessage(unittest.TestCase):

    def setUp(self):
        self.message = Message()
        self.err_msgs = []
        self.ok_msgs = []

        ipp = "1.1.1.1:1"
        s_id = {"suggested_id": 1}

        self.err_msgs.append({"header": {"version": 1, "id": 1, "payload": 0, "timing": 1, "ipp": ipp}, "body": s_id})
        self.err_msgs.append({"header": {"version": 1, "id": 1, "payload": 2, "timing": 1, "ipp": ipp}, "body": s_id})
        self.err_msgs.append({"header": {"version": 1, "id": 255, "payload": 0, "timing": 1, "ipp": ipp}, "body": s_id})
        self.err_msgs.append({"header": {"version": 1, "id": 2, "payload": 2, "timing": 1, "ipp": ipp}, "body": s_id})
        self.err_msgs.append({"header": {"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": ipp}, "body": s_id})

        self.ok_msgs.append({"header": {"version": 1, "id": 2, "payload": 3, "timing": 1, "ipp": ipp}, "body": s_id})
        self.ok_msgs.append({"header": {"version": 1, "id": 255, "payload": 1, "timing": 1, "ipp": ipp}, "body": s_id})
        self.ok_msgs.append({"header": {"version": 1, "id": 255, "payload": 2, "timing": 1, "ipp": ipp}, "body": s_id})
        self.ok_msgs.append({"header": {"version": 1, "id": 1, "payload": 1, "timing": 1, "ipp": ipp}, "body": s_id})
        self.ok_msgs.append({"header": {"version": 1, "id": 0, "payload": 0, "timing": 1, "ipp": ipp}, "body": s_id})
        self.ok_msgs.append({"header": {"version": 1, "id": 3, "payload": 1, "timing": 1, "ipp": ipp}, "body": s_id})

    def test_wrong_messages(self):
        for value in self.err_msgs:
            my_msg_recv = value
            self.assertEqual(self.message.validate_header(my_msg_recv['header']), True)
            self.assertEqual(self.message.validate_body(my_msg_recv['body']), True)
            self.assertEqual(self.message.validate_protocol(), False)

    def test_right_messages(self):
        for value in self.ok_msgs:
            my_msg_recv = value
            self.assertEqual(self.message.validate_header(my_msg_recv['header']), True)
            self.assertEqual(self.message.validate_body(my_msg_recv['body']), True)
            self.assertEqual(self.message.validate_protocol(), True)


class TestFullMessagePayloadUpdate(unittest.TestCase):

    def setUp(self):
        self.message = Message(payload=3)
        self.err_msgs = []
        self.ok_msgs = []

        ipp = "1.1.1.1:1"
        header = {"version": 1, "id": 1, "payload": 3, "timing": 1, "ipp": ipp}
        body = dict()

        body['action'] = 'a'
        self.err_msgs.append({"header": header, "body": body})
        body['action'] = 'switch'
        self.err_msgs.append({"header": header, "body": body})
        body['action'] = ''
        self.err_msgs.append({"header": header, "body": body})
        body['action'] = 0
        self.err_msgs.append({"header": header, "body": body})

        body['action'] = 'switch_config'
        self.ok_msgs.append({"header": header, "body": body})
        body['action'] = 'error'
        self.ok_msgs.append({"header": header, "body": body})
        body['action'] = 'msg_received'
        self.ok_msgs.append({"header": header, "body": body})
        body['action'] = 'entry_removed'
        self.ok_msgs.append({"header": header, "body": body})
        body['action'] = 'add_entry'
        self.ok_msgs.append({"header": header, "body": body})
        body['action'] = 'get_statistics'
        self.ok_msgs.append({"header": header, "body": body})
        body['action'] = 'send_probe'
        self.ok_msgs.append({"header": header, "body": body})

    def test_wrong_messages(self):
        for value in self.err_msgs:
            my_msg_recv = value
            self.assertEqual(self.message.validate_header(my_msg_recv['header']), True)
            self.assertEqual(self.message.validate_body(my_msg_recv['body']), True)
            self.assertEqual(self.message.validate_protocol(), False)

    def test_right_messages(self):
        for value in self.ok_msgs:
            my_msg_recv = value
            self.assertEqual(self.message.validate_header(my_msg_recv['header']), True)
            self.assertEqual(self.message.validate_body(my_msg_recv['body']), True)
            self.assertEqual(self.message.validate_protocol(), True)


class TestFullNegotiation(unittest.TestCase):

    def setUp(self):
        self.message = Message()
        self.core = CoreCal()

    def test_valid_negotiation(self):

        # Establishing connecting with Ctrl A
        # A sends the first packet
        # C generates a confirmation and sends back to A
        ipp_a = "1.1.1.1:1"
        s_id_a = {"suggested_id": 1}
        from_ctrl_a = {"header": {"version": 1, "id": 0, "payload": 0, "timing": 1, "ipp": ipp_a}, "body": s_id_a}
        self.assertEqual(self.message.validate_header(from_ctrl_a['header']), True)
        self.assertEqual(self.message.validate_body(from_ctrl_a['body']), True)
        self.assertEqual(self.message.validate_protocol(), True)
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
        self.assertEqual(self.message.validate_header(from_ctrl_a['header']), True)
        self.assertEqual(self.message.validate_body(from_ctrl_a['body']), True)
        self.assertEqual(self.message.validate_protocol(), True)
        self.core.process_incoming_message(from_ctrl_a)
        self.assertEqual(self.core.for_unittest, True)
        self.assertEqual((len(self.core.table_id) == 1 and self.core.table_id[1]['status'] == 'Assigned'), True)

        # Establishing connecting with Ctrl B
        ipp_b = "3.3.3.3:3"
        s_id_b = {"suggested_id": 1}
        from_ctrl_b = {"header": {"version": 1, "id": 0, "payload": 0, "timing": 1, "ipp": ipp_b}, "body": s_id_b}
        self.assertEqual(self.message.validate_header(from_ctrl_b['header']), True)
        self.assertEqual(self.message.validate_body(from_ctrl_b['body']), True)
        self.assertEqual(self.message.validate_protocol(), True)
        ipp_c = '192.168.56.3:6111'
        s_id_c = {"suggested_id": 2}
        answer = {"header": {"version": 1, "id": 255, "payload": 2, "timing": 100, "ipp": ipp_c}, "body": s_id_c}
        self.core.process_incoming_message(from_ctrl_b)
        self.assertEqual(self.core.for_unittest, answer)
        self.assertEqual((len(self.core.table_id) == 2 and self.core.table_id[2]['status'] == 'Reserved'), True)

if __name__ == '__main__':
    unittest.main()
