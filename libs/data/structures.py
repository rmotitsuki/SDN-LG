import collections.abc


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
    Class to represent a Node (an openflow switch). It stores all data concerning th switch
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

    @property
    def dpid(self):
        return self._dpid

    @dpid.setter
    def dpid(self, my_dpid):
        valid = True
        try:
            int(my_dpid, 16)
            if len(my_dpid) != 16:
                valid = False
        except ValueError:
            valid = False
        if valid:
            self._dpid = my_dpid
        else:
            raise NodeAttributeError('Datapath ID (dpid) must be a string representing a 64-bit hexadecimal')

    @property
    def controller_id(self):
        return self._controller_id

    @controller_id.setter
    def controller_id(self, my_controller_id):
        valid = True
        try:
            my_controller_id = int(my_controller_id)
            if my_controller_id < 1 or my_controller_id > 254:
                valid = False
        except ValueError:
            valid = False
        if valid:
            self._controller_id = int(my_controller_id)
        else:
            raise NodeAttributeError('Controller ID must be an integer between 1 and 254 (inclusive)')

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
        cond, my_n_tables = pos_int_or_none(my_n_tables)
        if cond:
            self._n_tables = my_n_tables
        else:
            raise NodeAttributeError('Number of tables must be a positive integer')

    @property
    def ports(self):
        return self._ports

    @ports.setter
    def ports(self, my_ports):
        valid = True
        if my_ports is not None:
            if isinstance(my_ports, collections.abc.Sequence):
                if not all(isinstance(p, Port) for p in my_ports):
                    valid = False
            else:
                valid = False
        else:
            my_ports = list()
        if valid:
            self._ports = my_ports
        else:
            raise NodeAttributeError('Ports must be a list of Port instances or None')

    @property
    def old_color(self):
        return self._old_color

    @old_color.setter
    def old_color(self, my_old_color):
        cond, my_old_color = pos_int_or_none(my_old_color)
        if cond:
            self._old_color = my_old_color
        else:
            raise NodeAttributeError('Color must be a positive integer')

    @property
    def color(self):
        return self._color

    @color.setter
    def color(self, my_color):
        cond, my_color = pos_int_or_none(my_color)
        if cond:
            self._color = my_color
        else:
            raise NodeAttributeError('Color must be a positive integer')

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

        self._instantiate_port(port)

    def _instantiate_port(self, port):
        self.port_no = port.get('port_no')
        self.name = port.get('name')
        self.speed = port.get('speed')
        self.neighbors = port.get('neighbors')
        self.uptime = port.get('uptime')

    @property
    def port_no(self):
        return self._port_no

    @port_no.setter
    def port_no(self, my_port_no):
        valid = True
        try:
            my_port_no = int(my_port_no)
            if my_port_no < 0:
                valid = False
        except (ValueError, TypeError):
            valid = False
        if valid:
            self._port_no = my_port_no
        else:
            raise PortAttributeError('Port number must be a positive integer')

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, my_name):
        if isinstance(my_name, str):
            self._name = my_name
        else:
            raise PortAttributeError('Name must be a string')


    @property
    def speed(self):
        return self._speed

    @speed.setter
    def speed(self, my_speed):
        valid = True
        try:
            my_speed = int(my_speed)
            if my_speed < 0:
                valid = False
        except (ValueError, TypeError):
            valid = False
        if valid:
            self._speed = my_speed
        else:
            raise PortAttributeError('Speed must be a positive integer')

    @property
    def neighbors(self):
        return self._neighbors

    @neighbors.setter
    def neighbors(self, my_neighbors):
        valid = True
        if my_neighbors is not None:
            if isinstance(my_neighbors, collections.abc.Sequence):
                if not all(isinstance(n, Node) for n in my_neighbors):
                    valid = False
            else:
                valid = False
        else:
            my_neighbors = list()
        if valid:
            self._neighbors = my_neighbors
        else:
            raise PortAttributeError('Neighbors must be a list of Node instances or None')

    @property
    def uptime(self):
        return self._uptime

    @uptime.setter
    def uptime(self, my_uptime):
        cond, my_uptime = pos_int_or_none(my_uptime)
        if cond:
            self._uptime = my_uptime
        else:
            raise PortAttributeError('Uptime must be a positive integer or None')