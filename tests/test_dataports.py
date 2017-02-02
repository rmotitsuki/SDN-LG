import unittest

from shared.cal.dataport import DataPort
from shared.cal.dataports import DataPorts


class TestDataPorts(unittest.TestCase):

    def setUp(self):
        self.ports = {}
        self.port1 = {'port_no': 1, 'name': 'a', 'reason': 'added', 'speed': '1G', 'state': 'up'}
        self.ports[1] = self.port1
        self.port2 = {'port_no': 2, 'name': 'b', 'reason': 'deleted', 'speed': '1G', 'state': 'down'}
        self.ports[2] = self.port2

        self.wrong_values = [[], 'a', 0, -1, 100000]
        self.right_values = [self.ports, {}]

    def test_wrong_values(self):

        for wrong_value in self.wrong_values:
            with self.assertRaises(ValueError):
                self.message = DataPorts(wrong_value)

    def test_right_values(self):

        for right_value in self.right_values:
            self.assertTrue(DataPorts(right_value))

    def test_right_get_port(self):
        self.message = DataPorts(self.ports)
        self.assertTrue(isinstance(self.message.get_port('a'), DataPort))
        self.assertTrue(isinstance(self.message.get_port('b'), DataPort))
        self.assertTrue(isinstance(self.message.get_port(1), DataPort))
        self.assertTrue(isinstance(self.message.get_port(2), DataPort))


if __name__ == '__main__':
    unittest.main()
