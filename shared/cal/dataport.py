
class DataPort:

    def __init__(self, port):
        self._port_no = None
        self._name = None
        self._reason = None
        self._speed = None
        self._state = None

        self._instantiate_vars(port)

    def _instantiate_vars(self, port):
        self.port_no = port['port_no']
        self.name = port['name']
        self.reason = port['reason']
        self.speed = port['speed']
        self.state = port['state']

    @property
    def port_no(self):
        return self._port_no

    @port_no.setter
    def port_no(self, port_no):
        try:
            if 1 <= int(port_no) <= 65535:
                self._port_no = int(port_no)
            else:
                raise ValueError
        except (ValueError, TypeError):
            raise ValueError("Invalid ID: must be int from 1 to 65535")

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, name):
        try:
            if isinstance(name, str) and len(name) > 0:
                self._name = name
            elif isinstance(name, int) and 0 < name <= 65535:
                self._name = name
            elif isinstance(name, bytes):
                self._name = name.decode('latin-1')
            else:
                raise ValueError
        except (ValueError, AttributeError):
            raise ValueError("Invalid Name: can not be empty")

    @property
    def reason(self):
        return self._reason

    @reason.setter
    def reason(self, reason):
        try:
            if reason in ['added', 'deleted', 'modified']:
                self._reason = reason
            else:
                raise ValueError
        except ValueError:
            raise ValueError("Invalid reason: (%s)" % reason)

    @property
    def speed(self):
        return self._speed

    @speed.setter
    def speed(self, speed):
        try:
            if len(speed) > 0:
                self._speed = speed
            else:
                raise ValueError
        except (ValueError, TypeError):
            raise ValueError("Invalid speed: can not be empty")

    @property
    def state(self):
        return self._state

    @state.setter
    def state(self, state):
        try:
            if state in ['up', 'down']:
                self._state = state
            else:
                raise ValueError
        except (ValueError, TypeError):
            raise ValueError("Invalid state: (%s)" % state)
