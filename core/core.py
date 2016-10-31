import time

from libs.data.structures import Node, Port
from libs.core.messagebroker import MessageBroker
from libs.cal.message import Message
from libs.cal.cal import CoreCal
import threading
import time
import collections.abc
from libs.core.configs import read_openflow_configs
from libs.signals.signals import Signal
from libs.utils.singleton import Singleton


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
        return self.links

    @links.setter
    def links(self, my_links):
        valid = True
        if my_links is not None:
            if isinstance(my_links, collections.abc.Sequence):
                for l in my_links:
                    for n1, p1, n2, p2 in l:
                        if not (isinstance(n1, Node) and isinstance(p1, Port)
                                and isinstance(n2, Node) and isinstance(p2, Port)):
                            valid = False
            else:
                valid = False
        else:
            my_links = list()
        if valid:
            self._links = my_links
        else:
            raise CoreAttributeError('Links must be a list of (Node, Port, Node, Port) or None')

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
        

class TopologyDiscovery:

    # Listen to switch_config
        # Send LLDP
    # Listen to PacketReceived(PacketIn)
        # Store to create topology
    def __init__(self, core):
        def packet_out():
            self.send_packet_out()
            time.sleep(PACKET_OUT_INTERVAL)
        self.core = core
        self.sendPacketOut = threading.Thread(target=packet_out)
        self.GenerateTopology = threading.Thread(RunTopology)

    def send_packet_out(self):
        print(self.core.links)

    def generate_topology(self):
        print(self.core.links)

