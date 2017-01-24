
class DataPort:

    def __init__(self, port):
        self._id = None
        self._name = None
        self._status = None
        self._speed = None

        self._instantiate_vars(port)

    def _instantiate_vars(self, port):
        self.id = port['port_no']
        self.name = port['name']
        self.status = port['status']
        self.speed = port['speed']

    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, port_no):
        try:
            if 1 <= int(port_no) <= 65535:
                self._id = int(port_no)
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
            else:
                raise ValueError
        except (ValueError, AttributeError):
            raise ValueError("Invalid Name: can not be empty")

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, status):
        try:
            if status in ['added', 'deleted', 'modified']:
                self._status = status
            else:
                raise ValueError
        except ValueError:
            raise ValueError("Invalid status: (%s)" % status)

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

