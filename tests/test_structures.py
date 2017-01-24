import unittest

from sdnlg.libs import Node, Port, NodeAttributeError, PortAttributeError


class TestNodeStructure(unittest.TestCase):

    def setUp(self):
        node_dict = {'dpid':'09a2c3d5e6f70912', 'controller_id':5, 'n_tables':2}
        self.node = Node(node_dict)

    def test_dpid(self):
        self.assertEqual(self.node.dpid, '09a2c3d5e6f70912')
        self.node.dpid = '1234'
        self.assertEqual(self.node.dpid, '1234')
        self.node.dpid = '1234567890abcdeg'
        self.assertEqual(self.node.dpid, '1234567890abcdeg')
        self.node.dpid = '1234567890abcdef'
        self.assertEqual(self.node.dpid, '1234567890abcdef')

    def test_controller_id(self):
        self.assertEqual(self.node.controller_id, 5)
        self.node.controller_id = 7
        self.assertEqual(self.node.controller_id, 7)
        with self.assertRaisesRegex(ValueError, 'invalid literal'):
            self.node.controller_id = 'b'
        self.assertEqual(self.node.controller_id, 7)
        self.node.controller_id = '98'
        self.assertEqual(self.node.controller_id, 98)
        self.node.controller_id = 278
        self.assertEqual(self.node.controller_id, 278)
        self.node.controller_id = -5
        self.assertEqual(self.node.controller_id, -5)

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
        with self.assertRaisesRegex(ValueError, 'invalid literal'):
            self.node.n_tables = 'fde12'
        self.assertEqual(self.node.n_tables, 2134)
        self.node.n_tables = -45
        self.assertEqual(self.node.n_tables, -45)
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
        ports = ['a', Port({'port_no': 6, 'name': 'P6', 'speed': 10000})]
        self.node.ports = ports
        self.assertEqual(self.node.ports, ports)
        self.node.ports = Port({'port_no': 8, 'name': 'P7', 'speed': 1000})
        self.assertEqual(self.node.ports, list())

    def colors_testing(self, fieldname):
        self.assertEqual(getattr(self.node, fieldname), None)
        setattr(self.node, fieldname, 543)
        self.assertEqual(getattr(self.node, fieldname), 543)
        with self.assertRaisesRegex(ValueError, 'invalid literal'):
            setattr(self.node, fieldname, 'adde')
        self.assertEqual(getattr(self.node, fieldname), 543)
        setattr(self.node, fieldname, None)
        self.assertEqual(getattr(self.node, fieldname), None)

    def test_old_color(self):
        self.colors_testing('old_color')

    def test_color(self):
        self.colors_testing('color')

    def test_contains(self):
        ports = [Port({'port_no': 6, 'name': 'P1', 'speed': 100}),
                 Port({'port_no': 5, 'name': 'P2', 'speed': 1000})]
        self.node.ports = ports
        self.assertTrue(Port({'port_no': 6, 'name': 'P1', 'speed': 100}) in self.node)
        self.assertFalse(Port({'port_no': 61, 'name': 'P1', 'speed': 100}) in self.node)
        with self.assertRaisesRegex(AttributeError, 'object has no attribute'):
            self.assertFalse('a' in self.node)

    def test_add_port(self):
        p1 = Port({'port_no': 6, 'name': 'P1', 'speed': 100})
        p2 = Port({'port_no': 5, 'name': 'P2', 'speed': 1000})
        self.node.add_port(p1)
        self.assertEqual(self.node.ports, [p1])
        self.node.add_port(p2)
        self.assertEqual(self.node.ports, [p1, p2])
        self.node.ports.append('xyz')
        self.assertEqual(self.node.ports, [p1, p2, 'xyz'])


class TestPortStructure(unittest.TestCase):

    def setUp(self):
        port_dict = {'port_no': 1, 'name': 'GigabitEthernet1/1', 'speed': 1}
        self.port = Port(port_dict)

    def test_port_no(self):
        self.assertEqual(self.port.port_no, 1)
        self.port.port_no = 50
        self.assertEqual(self.port.port_no, 50)
        self.port.port_no = '46'
        self.assertEqual(self.port.port_no, 46)
        self.port.port_no = -54
        self.assertEqual(self.port.port_no, -54)
        with self.assertRaisesRegex(ValueError, 'invalid literal'):
            self.port.port_no = 'qwer'
        self.assertEqual(self.port.port_no, -54)

    def test_name(self):
        self.assertEqual(self.port.name, 'GigabitEthernet1/1')
        self.port.name = 'abcdefg'
        self.assertEqual(self.port.name, 'abcdefg')
        self.port.name = []
        self.assertEqual(self.port.name, [])

    def test_speed(self):
        self.assertEqual(self.port.speed, 1)
        self.port.speed = 50
        self.assertEqual(self.port.speed, 50)
        self.port.speed = '46'
        self.assertEqual(self.port.speed, 46)
        self.port.speed = -54
        self.assertEqual(self.port.speed, -54)
        with self.assertRaisesRegex(ValueError, 'invalid literal'):
            self.port.speed = 'qwer'
        self.assertEqual(self.port.speed, -54)

    def test_neighbors(self):
        self.assertEqual(self.port.neighbors, list())
        nodes = [Node({'dpid': '09a2c3d5e6f70912', 'controller_id': 5, 'n_tables': 2}),
                 Node({'dpid': '09afc3dae6470912', 'controller_id': 67, 'n_tables': 1})]
        self.port.neighbors = nodes
        self.assertEqual(self.port.neighbors, nodes)
        nodes = [Node({'dpid': '09432c3d5e6f7912', 'controller_id': 5, 'n_tables': 2}), 'xyz']
        self.port.neighbors = nodes
        self.assertEqual(self.port.neighbors, nodes)
        self.port.neighbors = Node({'dpid': '09432c3d5e6f7912', 'controller_id': 5, 'n_tables': 2})
        self.assertEqual(self.port.neighbors, list())
        self.port.neighbors = None
        self.assertEqual(self.port.neighbors, list())

    def test_uptime(self):
        self.assertEqual(self.port.uptime, None)
        self.port.uptime = '2345'
        self.assertEqual(self.port.uptime, 2345)
        with self.assertRaisesRegex(ValueError, 'invalid literal'):
            self.port.uptime = 'abcdef'
        self.assertEqual(self.port.uptime, 2345)
        self.port.uptime = None
        self.assertEqual(self.port.uptime, None)
        self.port.uptime = -45
        self.assertEqual(self.port.uptime, -45)

if __name__ == '__main__':
    unittest.main()
