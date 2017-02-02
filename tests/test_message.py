import unittest

from shared.cal.message import Message, Header, Body


class TestMessageHeader(unittest.TestCase):

    def setUp(self):
        self.msg_recv = {"version": 1, "id": 0, "payload": 0, "timing": 1, "ipp": "192.168.56.101:6633"}

    # Test message.header.version
    def test_wrong_versions(self):
        values = [0, 'a', -1, "", '#']
        for value in values:
            self.msg_recv['version'] = value
            with self.assertRaises(ValueError):
                self.message = Header(self.msg_recv)

    def test_right_versions(self):
        values = [1, '1']
        for value in values:
            self.msg_recv['version'] = value
            self.assertTrue(Header(self.msg_recv))

    # Test message.header.id
    def test_wrong_ids(self):
        values = [256, 'a', -1, "", '#']
        for value in values:
            self.msg_recv['id'] = value
            with self.assertRaises(ValueError):
                self.message = Header(self.msg_recv)

    def test_right_ids(self):
        values = [0, 1, '1']
        for value in values:
            self.msg_recv['id'] = value
            self.assertTrue(Header(self.msg_recv))

    # Test message.header.payload
    def test_wrong_payloads(self):
        values = [256, 'a', -1, "", '#', 255]
        for value in values:
            self.msg_recv['payload'] = value
            with self.assertRaises(ValueError):
                self.message = Header(self.msg_recv)

    def test_right_payloads(self):
        values = [0, 1, '1', 2]
        for value in values:
            self.msg_recv['payload'] = value
            self.assertTrue(Header(self.msg_recv))

    # Test message.header.timing
    def test_wrong_timings(self):
        values = ['a', -1, "", '#']
        for value in values:
            self.msg_recv['timing'] = value
            with self.assertRaises(ValueError):
                self.message = Header(self.msg_recv)

    def test_right_timings(self):
        values = [0, 1, '1']
        for value in values:
            self.msg_recv['timing'] = value
            self.assertTrue(Header(self.msg_recv))

    # Test message.header.ipp
    def test_wrong_ipps(self):
        values = [256, 'a', -1, "", "0.0.1.0:100000", "12.4.2:2222", "255.255.255:65535", "12.4.2.22"]
        for value in values:
            self.msg_recv['ipp'] = value
            with self.assertRaises(ValueError):
                self.message = Header(self.msg_recv)

    def test_right_ipp(self):
        values = ["0.0.1.0:1", "12.12.4.2:2222", "255.255.255.255:65535"]
        for value in values:
            self.msg_recv['ipp'] = value
            self.assertTrue(Header(self.msg_recv))

    def test_wrong_semantic(self):
        self.errors = list()
        self.errors.append({"version": 1, "id": 0, "payload": 1, "timing": 1, "ipp": "192.168.56.101:6633"})
        self.errors.append({"version": 1, "id": 0, "payload": 2, "timing": 1, "ipp": "192.168.56.101:6633"})
        self.errors.append({"version": 1, "id": 0, "payload": 3, "timing": 1, "ipp": "192.168.56.101:6633"})
        self.errors.append({"version": 1, "id": 1, "payload": 0, "timing": 1, "ipp": "192.168.56.101:6633"})
        self.errors.append({"version": 1, "id": 1, "payload": 2, "timing": 1, "ipp": "192.168.56.101:6633"})
        self.errors.append({"version": 1, "id": 2, "payload": 0, "timing": 1, "ipp": "192.168.56.101:6633"})
        self.errors.append({"version": 1, "id": 2, "payload": 2, "timing": 1, "ipp": "192.168.56.101:6633"})
        self.errors.append({"version": 1, "id": 255, "payload": 0, "timing": 1, "ipp": "192.168.56.101:6633"})
        for error in self.errors:
            self.message = Header(error)
            with self.assertRaises(ValueError):
                self.message.validate_semantic()


class TestMessageBody(unittest.TestCase):

    def setUp(self):
        self.payload = 1
        self.my_body = dict()
        self.port = {'port_no': 1, 'name': 'eth3/1', 'status': 'added', 'speed': '100Gbps'}
        self.ports = []
        self.ports.append(self.port)
        self.action = {'n_tbls': 1, 'caps': 1, 'proto': 'OpenFlow1.0', 'ports': self.ports}

    # For default payload = 0, Test message.body.suggested_id
    def test_wrong_suggested_ids(self):
        for wrong_value in [0, 'a', -1, "", 256, '#']:
            self.my_body['suggested_id'] = wrong_value
            with self.assertRaises(ValueError):
                self.message = Body(self.payload, self.my_body)

    def test_right_suggested_ids(self):
        for right_value in [1, '1', 100, 254]:
            self.my_body['suggested_id'] = right_value
            self.assertTrue(Body(self.payload, self.my_body))

    # For payload = 3, Test actions
    def test_wrong_actions(self):
        self.payload = 3
        self.data = {}
        self.my_body = {"action": 1, "data": self.action, "dpid": "0"}
        for wrong_value in [0, 'a', -1, "", 'send', 'receive']:
            self.my_body['action'] = wrong_value
            with self.assertRaises(ValueError):
                self.message = Body(self.payload, self.my_body)

    def test_right_actions(self):
        self.payload = 3
        self.my_body = {"action": 1, "data": self.action, "dpid": "0"}
        values = ['switch_config', 'error', 'msg_received', 'entry_removed',
                  'modify_entry', 'get_statistics', 'send_probe']
        for value in values:
            self.my_body['action'] = value
            self.assertTrue(Body(self.payload, self.my_body))

    # For payload = 3, Test DPIDs
    def test_wrong_dpid(self):
        self.payload = 3
        self.my_body = {"action": 'switch_config', "data": self.action, "dpid": "0"}
        for wrong_value in [-1, "", 'aaaaaaaaaaaaaaaaaaa', ',', ':']:
            self.my_body['dpid'] = wrong_value
            with self.assertRaises(ValueError):
                self.message = Body(self.payload, self.my_body)

    def test_right_dpid(self):
        self.payload = 3
        self.my_body = {"action": 'switch_config', "data": self.action, "dpid": "0"}
        values = ['09a2c3d5e6f70912', '09add6f70912', '33333']
        for value in values:
            self.my_body['dpid'] = value
            self.assertTrue(Body(self.payload, self.my_body))


class TestFullMessageHello(unittest.TestCase):

    def setUp(self):
        self.err_msgs = []
        self.ok_msgs = []
        self.message = None
        ipp = "1.1.1.1:1"

        s_id = {"suggested_id": 1}

        self.err_msgs.append({"header": {"version": 1, "id": 1, "payload": 3, "timing": 1, "ipp": ipp}, "body": s_id})
        self.err_msgs.append({"header": {"version": 1, "id": 2, "payload": 3, "timing": 1, "ipp": ipp}, "body": s_id})
        self.err_msgs.append({"header": {"version": 1, "id": 255, "payload": 3, "timing": 1, "ipp": ipp}, "body": s_id})

        self.ok_msgs.append({"header": {"version": 1, "id": 1, "payload": 1, "timing": 1, "ipp": ipp}, "body": s_id})
        self.ok_msgs.append({"header": {"version": 1, "id": 0, "payload": 0, "timing": 1, "ipp": ipp}, "body": s_id})
        self.ok_msgs.append({"header": {"version": 1, "id": 255, "payload": 1, "timing": 1, "ipp": ipp}, "body": s_id})
        self.ok_msgs.append({"header": {"version": 1, "id": 255, "payload": 2, "timing": 1, "ipp": ipp}, "body": s_id})

    # ## Value Message semantic ##

    def test_wrong_messages(self):
        for msg in self.err_msgs:
            with self.assertRaises(ValueError):
                self.message = Message(msg)

    def test_right_messages(self):
        for msg in self.ok_msgs:
            self.assertTrue(Message(msg))


class TestFullMessagePayloadUpdate(unittest.TestCase):

    def setUp(self):
        self.err_msgs = []
        self.ok_msgs = []
        self.port = {'port_no': 1, 'name': 'eth3/1', 'reason': 'added', 'speed': '100Gbps', 'state': 'up'}
        self.ports = dict()
        self.ports[1] = self.port
        self.action = {'n_tbls': 1, 'caps': 1, 'proto': 'OpenFlow1.0', 'ports': self.ports}

        ipp = "1.1.1.1:1"
        header = {"version": 1, "id": 1, "payload": 3, "timing": 1, "ipp": ipp}

        # Wrong messages
        update = {"data": self.action, "dpid": "0"}
        self.err_msgs.append({"header": header, "body": update})
        update = {"action": 'switch_config', "dpid": "0"}
        self.err_msgs.append({"header": header, "body": update})
        update = {"action": 'switch_config', "data": {}}
        self.err_msgs.append({"header": header, "body": update})

        # Ok messages
        update = {"action": 'switch_config', "data": self.action, "dpid": "0"}
        #
        self.ok_msgs.append({"header": header, "body": update})
        header['id'] = 255
        self.ok_msgs.append({"header": header, "body": update})

    def test_malformed_messages(self):
        for msg in self.err_msgs:
            with self.assertRaises(ValueError):
                self.message = Message(msg)

    def test_right_messages(self):
        for msg in self.ok_msgs:
            self.assertTrue(Message(msg))


if __name__ == '__main__':
    unittest.main()
