"""
    Messages sent/received through the MessageBroker
"""

# Possible Payloads
ID_NEG = 0
HELLO = 1
REJECT = 2
UPDATE = 3

# Variables
FIRST_ID = 1
LAST_ID = 254
CORE_ID = 255


class Message:

    def __init__(self, msg):
        self.header = Header(msg['header'])
        self.body = Body(self.header.payload, msg['body'])

    def validate_message_format(self):
        if self.header.validate() and self.body.validate():
            if self.validate():
                return True
        return False

    def validate(self):
        return True if self.validate_all_fields() else False

    @staticmethod
    def validate_all_fields(self):
        """
            Returns:
                Create combinations of Headers and Bodies
        """
        return True


class Header(object):
    """
    """
    def __init__(self, header):
        self.__version = None
        self.__id = None
        self.__payload = None
        self.__timing = None
        self.__ipp = None

        self.__instantiate_vars(header)

    def __instantiate_vars(self, header):
        self.version = header['version']
        self.id = header['id']
        self.payload = header['payload']
        self.timing = header['timing']
        self.ipp = header['ipp']

    @property
    def version(self):
        return self.__version

    @version.setter
    def version(self, my_version):
        try:
            if int(my_version) == 1:
                # raise ValueError("Invalid Version: Only Version 1 is supported")
                self.__version = int(my_version)
        except ValueError:
            pass

    @property
    def id(self):
        return self.__id

    @id.setter
    def id(self, my_id):
        try:
            if 0 <= int(my_id) < 255:
                # raise ValueError(("ID must be between 0 and 255. Received: %s" % my_id))
                self.__id = int(my_id)
        except ValueError:
            pass

    @property
    def payload(self):
        return self.__payload

    @payload.setter
    def payload(self, my_payload):
        try:
            if 0 <= int(my_payload) < 255:
                # raise ValueError("Payload must be between 0 and 255")
                self.__payload = int(my_payload)
        except ValueError:
            pass

    @property
    def timing(self):
        return self.__timing

    @timing.setter
    def timing(self, my_timing):
        try:
            if int(my_timing) >= 0:
                # raise ValueError("Timing must be > 0")
                self.__timing = int(my_timing)
        except ValueError:
            pass

    @property
    def ipp(self):
        return self.__ipp

    @ipp.setter
    def ipp(self, my_ipp):
        try:
            ip, port = my_ipp.split(':')
            if 1 <= int(port) <= 65535:
                parts = ip.split('.')
                if len(parts) == 4 and all(0 <= int(part) < 256 for part in parts):
                    self.__ipp = my_ipp
        except (ValueError, AttributeError):
            pass

    def validate(self):
        if (self.version is None or self.id is None or self.payload is None
            or self.timing is None or self.ipp is None):
            return False
        return True

    def validate_semantic(self):
        if self.id == ID_NEG and self.payload != ID_NEG:
            # ID negotiation - ID and Payload must be 0
            return False
        elif (self.id != ID_NEG and
                      self.payload not in [HELLO, UPDATE]):
            # Communication Established - Payload == 1(Hello) or 3(Update)
            return False
        elif (self.id == CORE_ID and
                      self.payload not in [HELLO, REJECT, UPDATE]):
            # Core ID, can use Payload 1(Hello), 2(Reject) or 3(Update)
            return False
        return True


class Body(object):
    """

    """
    ACTIONS = ['switch_config', 'error', 'msg_received', 'entry_removed',
               'add_entry', 'get_statistics', 'send_probe']

    def __init__(self, header_payload, body):
        self.header_payload = header_payload
        self.__suggested_id = None
        self.__dpid = None
        self.__action = None
        self.__data = dict()

        if self.header_payload != UPDATE:
            self.suggested_id = body['suggested_id']
        else:
            self.dpid = body['dpid']
            self.action = body['action']
            self.data = body['data']
            print 'a'

    @property
    def suggested_id(self):
        return self.__suggested_id

    @suggested_id.setter
    def suggested_id(self, sid):
        try:
            if 1 <= int(sid) < 255:
                # raise ValueError(("ID must be between 0 and 255. Received: %s" % my_id))
                self.__suggested_id = int(sid)
        except ValueError:
            pass

    @property
    def dpid(self):
        return self.__dpid

    @dpid.setter
    def dpid(self, did):
        self.__dpid = did

    @property
    def action(self):
        return self.__action

    @action.setter
    def action(self, act):
        if act in self.ACTIONS:
            self.__action = act

    @property
    def data(self):
        return self.__data

    @data.setter
    def data(self, dt):
        self.__data = dt

    def validate(self):
        if self.header_payload != UPDATE:
            if self.suggested_id is not None:
                return True
        else:
            if self.action is not None:
                return True
        return False
