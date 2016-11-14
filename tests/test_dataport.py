import unittest
from libs.cal.dataport import DataPort


class TestDataPortNo(unittest.TestCase):

    def setUp(self):
        self.port = {'port_no': 1, 'name': 'a', 'status': 'added',
                     'speed': '1G'}
        self.wrong_values = [{}, '', 'a', 0, -1, 100000]
        self.right_values = [1, 2, 65535]


    def test_wrong_values(self):

        for wrong_value in self.wrong_values:
            with self.assertRaises(ValueError):
                self.port['port_no'] = wrong_value
                self.message = DataPort(self.port)

    def test_right_values(self):

        for right_value in self.right_values:
            self.port['port_no'] = right_value
            self.assertTrue(DataPort(self.port))


class TestDataPortName(unittest.TestCase):

    def setUp(self):
        self.port = {'port_no': 1, 'name': 'a', 'status': 'added',
                     'speed': '1G'}
        self.wrong_values = [{}, '', -1, 100000]
        self.right_values = [1, 'e2', 'et3/2', 65535]

    def test_wrong_values(self):
        for wrong_value in self.wrong_values:
            with self.assertRaises(ValueError):
                self.port['name'] = wrong_value
                self.message = DataPort(self.port)

    def test_right_values(self):
        for right_value in self.right_values:
            self.port['name'] = right_value
            self.assertTrue(DataPort(self.port))


class TestDataPortStatus(unittest.TestCase):

    def setUp(self):
        self.port = {'port_no': 1, 'name': 'a', 'status': 'added',
                     'speed': '1G'}
        self.wrong_values = [{}, '', -1, 100000, 'up', 'down']
        self.right_values = ['added', 'deleted', 'modified']

    def test_wrong_values(self):
        for wrong_value in self.wrong_values:
            with self.assertRaises(ValueError):
                self.port['status'] = wrong_value
                self.message = DataPort(self.port)

    def test_right_values(self):
        for right_value in self.right_values:
            self.port['status'] = right_value
            self.assertTrue(DataPort(self.port))


class TestDataPortSpeed(unittest.TestCase):

    def setUp(self):
        self.port = {'port_no': 1, 'name': 'a', 'status': 'added',
                     'speed': '1G'}
        self.wrong_values = [{}, '', -10,]
        self.right_values = ['1G', '10Gbps', '100Gbps']

    def test_wrong_values(self):
        for wrong_value in self.wrong_values:
            with self.assertRaises(ValueError):
                self.port['speed'] = wrong_value
                self.message = DataPort(self.port)

    def test_right_values(self):
        for right_value in self.right_values:
            self.port['speed'] = right_value
            self.assertTrue(DataPort(self.port))


if __name__ == '__main__':
    unittest.main()
