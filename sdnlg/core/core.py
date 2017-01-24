import collections.abc
import threading
import time
import time
from libs.data.structures import Node, Port
from libs.signals.signals import Signal
from libs.utils.singleton import Singleton

from sdnlg.libs.core.configs import read_openflow_configs
from shared.cal import CoreCal
from shared.cal import Message
from shared.messagebroker import MessageBroker

confs = read_openflow_configs()
PACKET_OUT_INTERVAL = confs['PACKET_OUT_INTERVAL']


# Defined signals
SIGNAL_PACKET_IN = Signal()
SIGNAL_PORT_STATUS = Signal()


class CoreAttributeError(Exception):
    pass


class Core(object, metaclass=Singleton):
    """
    The Core class. Controls the communication between the vaious modules of the SDN-LG. It is a Singleton.
    """
    def __init__(self):

        self._switches = list()
        self._links = list()
        self._dispatcher = None
        self._cal = CoreCal()

    @property
    def switches(self):
        return self._switches

    @switches.setter
    def switches(self, my_switches):
        valid = True
        if my_switches is not None:
            if isinstance(my_switches, collections.abc.Sequence):
                if not all(isinstance(s, Node) for s in my_switches):
                    valid = False
            else:
                valid = False
        else:
            my_switches = list()
        if valid:
            self._switches = my_switches
        else:
            raise CoreAttributeError('Switches must be a list of Node instances or None')

    @property
    def links(self):
        return self._links

    @links.setter
    def links(self, my_links):
        valid = True
        if my_links is not None:
            if isinstance(my_links, collections.abc.Sequence):
                for p1, p2 in my_links:
                    if not isinstance(p1, Port) and isinstance(p2, Port):
                        valid = False
            else:
                valid = False
        else:
            my_links = list()
        if valid:
            self._links = my_links
        else:
            raise CoreAttributeError('Links must be a list of (Port, Port) or None')

    def send_packet(self, node, port, data):
        msg = Message()
        msg.header.id = 255

    def switch_exists(self, dpid):
        for s in self.switches:
            if s.dpid == dpid:
                return s
        return False

    def add_switch(self, dpid, controller_id, data):
        # add a switch to the list
        node = Node({'dpid': dpid, 'controller_id': controller_id, 'n_tables': data['n_tables'],
                     'capabilities': data['capabilities']})
        for p in data['ports']:
            port = Port({'port_no': p['id'], 'name': p['name'], 'speed': p['speed']})
            node.ports.append(port)
        self.switches.append(node)

    def remove_switch(self, dpid):
        # remove a switch from the list
        s = self.switch_exists(dpid)
        if s:
            self.switches.remove(s)

    def update_switch(self, s, dpid, controller_id, data):
        s.dpid = dpid
        s.controller_id = controller_id
        s.n_tables = data['n_tables']
        s.capabilities = data['capabilities']

    def add_port(self, dpid, port):
        # add a port to a existing switch
        s = self.switch_exists(dpid)
        if s:
            s.ports.append(port)

    def remove_port(self, dpid, port):
        s = self.switch_exists(dpid)
        if s:
            if isinstance(port, Port):
                s.ports.remove(port)
            else:
                p = s.port_no(port['id'])
                s.ports.remove(p)

    def switch_config(self, dpid, controller_id, data):
        s = self.switch_exists(dpid)
        if not s:
            self.add_switch(dpid, controller_id, data)
        else:
            self.update_switch(s, dpid, controller_id, data)

    def get_stats(self):
        pass

    def push_flow(self, node, action, flow):
        pass

    def packet_in(self, msg):
        SIGNAL_PACKET_IN.send(sender='core', msg=msg)

    def color_node(self, node, color):
        node.old_color = node.color
        node.color = color


def cube():
    import random
    nodes = [Node({'dpid':'0000000000000001', 'controller_id': 1, 'capabilities':'', 'n_tables':5})]
    nodes.append(Node({'dpid':'0000000000000002', 'controller_id': 1, 'capabilities':'', 'n_tables':5}))
    nodes.append(Node({'dpid': '0000000000000003', 'controller_id': 2, 'capabilities': '', 'n_tables': 5}))
    nodes.append(Node({'dpid': '0000000000000004', 'controller_id': 2, 'capabilities': '', 'n_tables': 5}))
    nodes.append(Node({'dpid': '0000000000000005', 'controller_id': 3, 'capabilities': '', 'n_tables': 5}))
    nodes.append(Node({'dpid': '0000000000000006', 'controller_id': 1, 'capabilities': '', 'n_tables': 5}))
    nodes.append(Node({'dpid': '0000000000000007', 'controller_id': 1, 'capabilities': '', 'n_tables': 5}))

    ports = []
    for i in range(1, 9):
        ports.append(Port({'port_no':i, 'name': '10Gigabit{}'.format(i), 'speed':10000000000,
                           'uptime':random.randint(0,1234567)}))
    for i in range(9, 17):
        ports.append(Port({'port_no':i, 'name': 'Gigabit{}'.format(i), 'speed':1000000000,
                           'uptime':random.randint(0,1234567)}))
    nodes[0].ports = ports

    ports = []
    for i in range(1, 17):
        ports.append(Port({'port_no':i, 'name': '10Gigabit{}'.format(i), 'speed':10000000000,
                           'uptime':random.randint(0,1234567)}))
    nodes[1].ports = ports

    ports = []
    for i in range(1, 9):
        ports.append(Port({'port_no':i, 'name': '10Gigabit{}'.format(i), 'speed':10000000000,
                           'uptime':random.randint(0,1234567)}))
    for i in range(9, 24):
        ports.append(Port({'port_no': i, 'name': 'Gigabit{}'.format(i), 'speed': 1000000000,
                           'uptime': random.randint(0, 1234567)}))
    nodes[2].ports = ports

    ports = []
    for i in range(1, 9):
        ports.append(Port({'port_no': i, 'name': 'Gigabit{}'.format(i), 'speed': 1000000000,
                           'uptime': random.randint(0, 1234567)}))
    nodes[3].ports = ports

    ports = []
    for i in range(1, 9):
        ports.append(Port({'port_no': i, 'name': 'Gigabit{}'.format(i), 'speed': 1000000000,
                           'uptime': random.randint(0, 1234567)}))
    for i in range(9, 11):
        ports.append(Port({'port_no': i, 'name': '10Gigabit{}'.format(i), 'speed': 10000000000,
                           'uptime': random.randint(0, 1234567)}))
    nodes[4].ports = ports

    ports = []
    for i in range(1, 17):
        ports.append(Port({'port_no': i, 'name': 'Gigabit{}'.format(i), 'speed': 1000000000,
                           'uptime': random.randint(0, 1234567)}))
    nodes[5].ports = ports

    ports = []
    for i in range(1, 9):
        ports.append(Port({'port_no': i, 'name': '10Gigabit{}'.format(i), 'speed': 10000000000,
                           'uptime': random.randint(0, 1234567)}))
    nodes[6].ports = ports

    links = [(nodes[0].ports[2], nodes[1].ports[5]),
             (nodes[0].ports[12], nodes[5].ports[2]),
             (nodes[0].ports[7], nodes[6].ports[5]),
             (nodes[1].ports[2], nodes[2].ports[3]),
             (nodes[2].ports[21], nodes[3].ports[5]),
             (nodes[2].ports[2], nodes[6].ports[3]),
             (nodes[3].ports[7], nodes[4].ports[5]),
             (nodes[4].ports[2], nodes[5].ports[5]),
             (nodes[4].ports[9], nodes[6].ports[1])
             ]

    return nodes, links


def cube1():
    nodes, links = cube()
    links[8] = (nodes[4].ports[4], nodes[2].ports[13])
    return nodes, links


class TopologyDiscovery:

    # Listen to switch_config
        # Send LLDP
    # Listen to PacketReceived(PacketIn)
        # Store to create topology
    def __init__(self, core):
        def packet_out():
            while True:
                self.send_packet_out()
                time.sleep(PACKET_OUT_INTERVAL)

        def run_topology():
            i = 0
            while True:
                switches, links = cube() if i % 2 == 0 else cube1()
                self.core.switches = switches
                self.core.links = links
                time.sleep(20)
                i += 1

        self.core = core
        self.sendPacketOut = threading.Thread(target=packet_out)
        self.generate_topology = threading.Thread(target=run_topology)
        self.generate_topology.start()

    def send_packet_out(self):
        print(self.core.links)

    def generate_topology(self):
        print(self.core.links)


