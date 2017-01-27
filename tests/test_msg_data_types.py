import unittest

from shared.cal import DataSwitchConfig


class TestDataSwitchConfig(unittest.TestCase):

    def setUp(self):
        self.sw_config = {'n_tbls': 1, 'caps': 1, 'proto': 'OpenFlow1.0',
                          'ports': [{'port_no': 1, 'name': 'a', 'speed': '1g',
                                     'status': 'added'}]}

    # Test number of tables
    def test_wrong_values_n_tbls(self):
        self.wrong_values = [{}, '', 'a', 0, -1, 100000]
        for wrong_value in self.wrong_values:
            with self.assertRaises(ValueError):
                self.sw_config['n_tbls'] = wrong_value
                self.message = DataSwitchConfig(self.sw_config)

    def test_right_values_n_tbls(self):
        self.right_values = [1, 2, 65000]
        for right_value in self.right_values:
            self.sw_config['n_tbls'] = right_value
            self.assertTrue(DataSwitchConfig(self.sw_config))

    # Test capabilities
    def test_wrong_values_caps(self):
        self.wrong_values = [{}, '', 'a', -1, 100000]
        for wrong_value in self.wrong_values:
            with self.assertRaises(ValueError):
                self.sw_config['caps'] = wrong_value
                self.message = DataSwitchConfig(self.sw_config)

    def test_right_values_caps(self):
        self.right_values = [1, 2, 3]
        for right_value in self.right_values:
            self.sw_config['caps'] = right_value
            self.assertTrue(DataSwitchConfig(self.sw_config))

    # Test protocols
    def test_wrong_values_proto(self):
        self.wrong_values = [{}, '', 'a', 0, -1, 100000]
        for wrong_value in self.wrong_values:
            with self.assertRaises(ValueError):
                self.sw_config['proto'] = wrong_value
                self.message = DataSwitchConfig(self.sw_config)

    def test_right_values_proto(self):
        self.right_values = ['OpenFlow1.0', 'OpenFlow1.3']
        for right_value in self.right_values:
            self.sw_config['proto'] = right_value
            self.assertTrue(DataSwitchConfig(self.sw_config))


if __name__ == '__main__':
    unittest.main()
