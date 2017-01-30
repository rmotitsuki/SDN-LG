import unittest
import time
from core.core import Core, SIGNAL_PACKET_IN, TopologyDiscovery


class TestCore(unittest.TestCase):

    def setUp(self):
        self.core = Core()
        self.core.switches = None
        self.ports = [{'id': 2, 'name': 'port2', 'speed': 1000000000},
                 {'id': 5, 'name': 'port5', 'speed': 1000000000}]
        self.data = {'n_tables': 2, 'capabilities': 'abcdef', 'proto': 'OF10', 'ports': self.ports}

    def test_add_switch(self):
        self.core.add_switch('1234567890abcdef', 12, self.data)
        self.assertEqual(len(self.core.switches), 1)
        self.assertEqual(self.core.switches[0].dpid, '1234567890abcdef')

    def test_remove_port(self):
        self.core.add_switch('fdecba0987654321', 13, self.data)
        self.core.remove_port('fdecba0987654321', self.ports[0])
        self.assertEqual(len(self.core.switches[0].ports), 1)
        self.assertEqual(self.core.switches[0].ports[0].port_no, 5)

    def test_singleton(self):
        core2 = Core()
        core3 = Core()
        self.assertTrue(self.core is core2)
        self.assertTrue(self.core is core3)
        self.core.add_switch('1234567890abcdef', 13, self.data)
        self.assertEqual(len(core2.switches), 1)


class TestTopologyDiscovery(unittest.TestCase):

    def setUp(self):
        self.core = Core()
        TopologyDiscovery(self.core)
        self.core.switches = None
        self.ports1 = [{'id': 2, 'name': 'port2', 'speed': 1000000000},
                      {'id': 5, 'name': 'port5', 'speed': 1000000000}]
        self.data1 = {'n_tables': 2, 'capabilities': 'abcdef', 'proto': 'OF10', 'ports': self.ports1}
        self.ports2 = [{'id': 4, 'name': 'port4', 'speed': 1000000000},
                       {'id': 8, 'name': 'port8', 'speed': 1000000000}]
        self.data2 = {'n_tables': 2, 'capabilities': 'abcdef', 'proto': 'OF10', 'ports': self.ports2}
        self.core.add_switch('1234567890abcdef', 12, self.data1)
        self.core.add_switch('fdecba0987654321', 13, self.data2)

    def test_packet_in(self):
        self.assertEqual(self.core.links, [])
        pkt = {'p1': self.ports1[0], 'p2': self.ports2[1]}
        SIGNAL_PACKET_IN.send(pkt=pkt)
        self.assertEqual(self.core.links, [(pkt['p1'], pkt['p2'])])


if __name__ == '__main__':
    unittest.main()
