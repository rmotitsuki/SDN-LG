import collections.abc

from shared.cal import cal


class NodeAttributeError(Exception):
    pass


class PortAttributeError(Exception):
    pass


def pos_int_or_none(value):
    if value is None:
        return (True, None)
    try:
        v = int(value)
        return (True, v) if v >= 0 else (False, None)
    except ValueError:
        return (False, None)


class Node(object):
    """
    Class to represent a Node (an openflow switch). It stores all data concerning the switch
    """
    def __init__(self, node):
        self._dpid = None
        self._controller_id = None
        self._capabilities = None
        self._n_tables = None
        self._ports = list()
        self._old_color = None
        self._color = None
        self._instantiate_vars(node)

    def _instantiate_vars(self, node):
        self.dpid = node.get('dpid')
        self.controller_id = node.get('controller_id')
        self.capabilities = node.get('capabilities')
        self.n_tables = node.get('n_tables')
        self.ports = node.get('ports')
        self.old_color = node.get('old_color')
        self.color = node.get('color')

    @property
    def dpid(self):
        return self._dpid

    @dpid.setter
    def dpid(self, my_dpid):
        # Set the dpid. It must represent a 64-bit hexadecimal
        self._dpid = my_dpid

    @property
    def controller_id(self):
        return self._controller_id

    @controller_id.setter
    def controller_id(self, my_controller_id):
        # The controller id must be an integer between FIRST and LAST ID (now 1 and 254)
        # This method accepts a string representing an integer, but the value stored is always int
        # Cannot be None
       self._controller_id = int(my_controller_id)

    @property
    def capabilities(self):
        return self._capabilities

    @capabilities.setter
    def capabilities(self, my_capabilities):
        self._capabilities = my_capabilities

    @property
    def n_tables(self):
        return self._n_tables

    @n_tables.setter
    def n_tables(self, my_n_tables):
        # Number of tables must be an integer greater or equal 0. None is also accepted
        if my_n_tables is not None:
            my_n_tables = int(my_n_tables)
        self._n_tables = my_n_tables

    @property
    def ports(self):
        return self._ports

    @ports.setter
    def ports(self, my_ports):
        if isinstance(my_ports, collections.abc.Sequence):
            self._ports = my_ports
        else:
            self._ports = list()
        for port in self.ports:
            try:
                port.node = self
            except AttributeError:
                pass

    @property
    def old_color(self):
        return self._old_color

    @old_color.setter
    def old_color(self, my_old_color):
        if my_old_color is not None:
            my_old_color = int(my_old_color)
        self._old_color = my_old_color

    @property
    def color(self):
        return self._color

    @color.setter
    def color(self, my_color):
        if my_color is not None:
            my_color = int(my_color)
        self._color = my_color

    def add_port(self, port):
        if port not in self:
            self.ports.append(port)
            port.node = self

    def port_no(self, port_no):
        for p in self.ports:
            if p.port_no == port_no:
                return p
        return None

    def __contains__(self, port):
        for p in self.ports:
            if p.port_no == port.port_no and p.name == port.name and p.speed == port.speed:
                return True
        return False

    def __repr__(self):
        return '<Node {}, controlled by controller {}>'.format(self.dpid, self.controller_id)


class Port(object):
    """
    Class to represent a port in a Node (switch)
    """
    def __init__(self, port):
        self._port_no = None
        self._name = None
        self._speed = None
        self._neighbors = list()
        self._uptime = None
        self._node = None
        self._state = None

        self._instantiate_port(port)

    def _instantiate_port(self, port):
        self.port_no = port.get('port_no')
        self.name = port.get('name')
        self.speed = port.get('speed')
        self.neighbors = port.get('neighbors')
        self.uptime = port.get('uptime')
        self.state = port.get('state')

    def __eq__(self, other):
        return self.port_no == other.port_no and self.name == other.name and self.speed == other.speed

    @property
    def port_no(self):
        return self._port_no

    @port_no.setter
    def port_no(self, my_port_no):
        self._port_no = int(my_port_no)

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, my_name):
        self._name = my_name

    @property
    def speed(self):
        return self._speed

    @speed.setter
    def speed(self, my_speed):
        self._speed = my_speed

    @property
    def neighbors(self):
        return self._neighbors

    @neighbors.setter
    def neighbors(self, my_neighbors):
        if isinstance(my_neighbors, collections.abc.Sequence):
            self._neighbors = my_neighbors
        else:
            self._neighbors = list()

    @property
    def uptime(self):
        return self._uptime

    @uptime.setter
    def uptime(self, my_uptime):
        if my_uptime is not None:
            my_uptime = int(my_uptime)
        self._uptime = my_uptime

    @property
    def node(self):
        return self._node

    @node.setter
    def node(self, my_node):
        self._node = my_node

    @property
    def state(self):
        return self._state

    @state.setter
    def state(self, my_state):
        self._state = my_state