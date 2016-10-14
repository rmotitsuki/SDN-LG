import unittest
from libs.data.structures import Node, Port, NodeAttributeError, PortAttributeError


class TestNodeStructure(unittest.TestCase):

    def setUp(self):
        node_dict = {'dpid':'09a2c3d5e6f70912', 'controller_id':5, 'n_tables':2}
        self.node = Node(node_dict)

    def test_dpid(self):
        self.assertEqual(self.node.dpid, '09a2c3d5e6f70912')
        with self.assertRaisesRegex(NodeAttributeError,
                                    'Datapath ID \(dpid\) must be a string representing a 64-bit hexadecimal'):
            self.node.dpid = '1234'
        self.assertEqual(self.node.dpid, '09a2c3d5e6f70912')
        with self.assertRaisesRegex(NodeAttributeError,
                                    'Datapath ID \(dpid\) must be a string representing a 64-bit hexadecimal'):
            self.node.dpid = '1234567890abcdeg'
        self.assertEqual(self.node.dpid, '09a2c3d5e6f70912')
        self.node.dpid = '1234567890abcdef'
        self.assertEqual(self.node.dpid, '1234567890abcdef')

    def test_controller_id(self):
        self.assertEqual(self.node.controller_id, 5)
        self.node.controller_id = 7
        self.assertEqual(self.node.controller_id, 7)
        with self.assertRaisesRegex(NodeAttributeError, 'Controller ID must be an integer between 1 and 254'):
            self.node.controller_id = 'b'
        self.assertEqual(self.node.controller_id, 7)
        self.node.controller_id = '98'
        self.assertEqual(self.node.controller_id, 98)
        with self.assertRaisesRegex(NodeAttributeError, 'Controller ID must be an integer between 1 and 254'):
            self.node.controller_id = 278
        self.assertEqual(self.node.controller_id, 98)
        with self.assertRaisesRegex(NodeAttributeError, 'Controller ID must be an integer between 1 and 254'):
            self.node.controller_id = -5
        self.assertEqual(self.node.controller_id, 98)

    def test_capabilities(self):
        self.assertEqual(self.node.capabilities, None)
        self.node.capabilities = '123'
        self.assertEqual(self.node.capabilities, '123')
        self.node.capabilities = 4567
        self.assertEqual(self.node.capabilities, 4567)

    def test_n_tables(self):
        self.assertEqual(self.node.n_tables, 2)
        self.node.n_tables = '2134'
        self.assertEqual(self.node.n_tables, 2134)
        with self.assertRaisesRegex(NodeAttributeError, 'Number of tables must be a positive integer'):
            self.node.n_tables = 'fde12'
        self.assertEqual(self.node.n_tables, 2134)
        with self.assertRaisesRegex(NodeAttributeError, 'Number of tables must be a positive integer'):
            self.node.n_tables = -45
        self.assertEqual(self.node.n_tables, 2134)
        self.node.n_tables = 65
        self.assertEqual(self.node.n_tables, 65)

    def test_ports(self):
        self.assertEqual(self.node.ports, list())
        ports = [Port({'port_no': 6, 'name': 'P1', 'speed': 100}),
                 Port({'port_no': 5, 'name': 'P2', 'speed': 1000})]
        self.node.ports = ports
        self.assertEqual(self.node.ports, ports)
        self.node.ports = None
        self.assertEqual(self.node.ports, list())
        with self.assertRaisesRegex(NodeAttributeError, 'Ports must be a list of Port instances or None'):
            self.node.ports = ['a', Port({'port_no': 6, 'name': 'P6', 'speed': 10000})]
        self.assertEqual(self.node.ports, list())
        with self.assertRaisesRegex(NodeAttributeError, 'Ports must be a list of Port instances or None'):
            self.node.ports = Port({'port_no': 8, 'name': 'P7', 'speed': 1000})
        self.assertEqual(self.node.ports, list())

    def colors_testing(self, fieldname):
        self.assertEqual(getattr(self.node, fieldname), None)
        setattr(self.node, fieldname, 543)
        self.assertEqual(getattr(self.node, fieldname), 543)
        with self.assertRaisesRegex(NodeAttributeError, 'Color must be a positive integer'):
            setattr(self.node, fieldname, 'adde')
        self.assertEqual(getattr(self.node, fieldname), 543)
        setattr(self.node, fieldname, None)
        self.assertEqual(getattr(self.node, fieldname), None)

    def test_old_color(self):
        self.colors_testing('old_color')

    def test_color(self):
        self.colors_testing('color')


class TestPortStructure(unittest.TestCase):

    def setUp(self):
        port_dict = {'port_no': 1, 'name':'GigabitEthernet1/1', 'speed':1000000000}
        self.port = Port(port_dict)

    def test_port_no(self):
        self.assertEqual(self.port.port_no, 1)
        self.port.port_no = '43'
        self.assertEqual(self.port.port_no, 43)
        with self.assertRaisesRegex(PortAttributeError, 'Port number must be a positive integer'):
            self.port.port_no = -23
        self.assertEqual(self.port.port_no, 43)
        with self.assertRaisesRegex(PortAttributeError, 'Port number must be a positive integer'):
            self.port.port_no = 'abc'
        self.assertEqual(self.port.port_no, 43)
        with self.assertRaisesRegex(PortAttributeError, 'Port number must be a positive integer'):
            self.port.port_no = None
        self.assertEqual(self.port.port_no, 43)

    def test_name(self):
        self.assertEqual(self.port.name, 'GigabitEthernet1/1')
        self.port.name = 'abcdefg'
        self.assertEqual(self.port.name, 'abcdefg')
        with self.assertRaisesRegex(PortAttributeError, 'Name must be a string'):
            self.port.name = []
        self.assertEqual(self.port.name, 'abcdefg')
        with self.assertRaisesRegex(PortAttributeError, 'Name must be a string'):
            self.port.name = None
        self.assertEqual(self.port.name, 'abcdefg')



if __name__ == '__main__':
    unittest.main()
