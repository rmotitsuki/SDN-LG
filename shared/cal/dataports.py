from shared.cal.dataport import DataPort


class DataPorts:

    def __init__(self, ports):
        self._dports = None
        self._instantiate_vars(ports)

    def _instantiate_vars(self, ports):
        self.dports = ports

    @property
    def dports(self):
        return self._dports

    @dports.setter
    def dports(self, ports):
        temp = dict()
        if isinstance(ports, dict):
            if len(ports) > 0:
                for port in ports:
                    temp[port] = DataPort(ports[port])
                self._dports = temp
            else:
                self._dports = dict()
        else:
            raise ValueError('Invalid Ports Value provided')

    def get_port(self, port):
        if isinstance(port, int):
            return self.get_port_by_number(port)
        elif isinstance(port, str):
            return self.get_port_by_name(port)
        else:
            raise ValueError("Invalid port provided")

    def get_port_by_number(self, port):
        for dport in self.dports:
            if self.dports[dport].port_no == port:
                return self.dports[dport]
        return 0

    def get_port_by_name(self, port):
        for dport in self.dports:
            if self.dports[dport].name == port:
                return self.dports[dport]
        return '0'
