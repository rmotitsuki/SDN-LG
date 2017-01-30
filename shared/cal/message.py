"""
    Messages sent/received through the MessageBroker
"""
import shared.cal.msg_data_types as data_types


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


class Header(object):
    """
    """
    def __init__(self, header):
        self._version = None
        self._id = None
        self._payload = None
        self._timing = None
        self._ipp = None

        self._instantiate_vars(header)

    def _instantiate_vars(self, header):
        self.version = header['version']
        self.id = header['id']
        self.payload = header['payload']
        self.timing = header['timing']
        self.ipp = header['ipp']

    @property
    def version(self):
        return self._version

    @version.setter
    def version(self, my_version):
        try:
            if int(my_version) == 1:
                self._version = int(my_version)
            else:
                raise ValueError
        except ValueError:
            raise ValueError("Invalid Version: Only Version 1 is supported")

    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, my_id):
        try:
            if 0 <= int(my_id) <= 255:
                self._id = int(my_id)
            else:
                raise ValueError
        except ValueError:
            raise ValueError(("ID must be between 0 and 255. Received: %s" % my_id))

    @property
    def payload(self):
        return self._payload

    @payload.setter
    def payload(self, my_payload):
        try:
            if 0 <= int(my_payload) < 4:
                self._payload = int(my_payload)
            else:
                raise ValueError
        except ValueError:
            raise ValueError("Payload must be between 0 and 4")

    @property
    def timing(self):
        return self._timing

    @timing.setter
    def timing(self, my_timing):
        try:
            if int(my_timing) >= 0:
                self._timing = int(my_timing)
            else:
                raise ValueError
        except ValueError:
            raise ValueError("Timing must be > 0")

    @property
    def ipp(self):
        return self._ipp

    @ipp.setter
    def ipp(self, my_ipp):
        try:
            ip, port = my_ipp.split(':')
            if 1 <= int(port) <= 65535:
                parts = ip.split('.')
                if len(parts) == 4 and all(0 <= int(part) < 256 for part in parts):
                    self._ipp = my_ipp
                else:
                    raise ValueError
            else:
                raise ValueError
        except (ValueError, AttributeError):
            raise ValueError("IPP has the wrong format")

    def validate_semantic(self):
        if self.id == ID_NEG and self.payload != ID_NEG:
            # ID negotiation - ID and Payload must be 0
            raise ValueError("Header has a semantic error")
        elif (self.id != ID_NEG and
              self.payload not in [HELLO, UPDATE]):
            # Communication Established - Payload == 1(Hello) or 3(Update)
            raise ValueError("Header has a semantic error")
        elif (self.id == CORE_ID and
              self.payload not in [HELLO, REJECT, UPDATE]):
            # Core ID, can use Payload 1(Hello), 2(Reject) or 3(Update)
            raise ValueError("Header has a semantic error")
        return True


class Body(object):
    """

    """
    def __init__(self, header_payload, body):
        self.header_payload = header_payload
        self._suggested_id = None
        self._dpid = None
        self._action = None
        self._data = dict()

        if self.validate_semantic(body):
            if self.header_payload != UPDATE:
                self.suggested_id = body['suggested_id']
            else:
                self.dpid = body['dpid']
                self.action = body['action']
                self.data = body['data']
        else:
            raise ValueError("Semantic Error Detected")

    @property
    def suggested_id(self):
        return self._suggested_id

    @suggested_id.setter
    def suggested_id(self, sid):
        try:
            if 1 <= int(sid) < 255:
                self._suggested_id = int(sid)
            else:
                raise ValueError
        except ValueError:
            raise ValueError(("ID must be between 1 and 254. Received: %s" % sid))

    @property
    def dpid(self):
        return self._dpid

    @dpid.setter
    def dpid(self, did):
        try:
            if len(did) <= 16 and did.isalnum():
                self._dpid = did
            else:
                raise ValueError
        except (ValueError, TypeError):
            raise ValueError("DPID must be <= 16 chars and alpha numeric only")

    @property
    def action(self):
        return self._action

    @action.setter
    def action(self, act):
        actions = ['switch_config', 'error', 'msg_received', 'entry_removed',
                   'modify_entry', 'get_statistics', 'send_probe']
        if act in actions:
            self._action = act
        else:
            raise ValueError("Invalid Action Provided")

    @property
    def data(self):
        return self._data

    @data.setter
    def data(self, dt):
        self._data = data_types.set_actions(self.action, dt)

    def validate_semantic(self, body):
        if self.header_payload in [ID_NEG, HELLO, REJECT]:
            if 'suggested_id' not in body:
                raise ValueError
        elif self.header_payload == UPDATE:
            fields = ['dpid', 'action', 'data']
            for field in fields:
                if field not in body:
                    raise ValueError
        return True
