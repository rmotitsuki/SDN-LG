import time
import collections


class InvalidMessageError(Exception):
    pass


class IncorrectBodyError(Exception):
    pass


class IncorrectActionError(Exception):
    pass


PAYLOADS = {
    0: 'Start - ID Negotiation',
    1: 'Hello - Keepalive',
    2: 'Reject - Errors',
    3: 'Update - Async Messages',
}


ACTIONS = [
    'switch_config',
    'error',
    'msg_received',
]

class Message(object):
    
    def __init__(self, msgid=0, payload=0, body=None, version=1):
        """

        Args:
            msgid: The id of the controller, zero if negotiating
            payload: The type of the message
            body: Body of the message
            version: Version of SDN-LG Messaging
        """
        payload = int(payload)
        msgid = int(msgid)
        version = int(version)
        if not 0 <= payload <= 9:
            raise InvalidMessageError("Payload must be between 0 and 9, but it is %d" % payload)
        if not 0 <= msgid <= 255:
            raise InvalidMessageError("ID must be between 0 and 255, but it is %d" % msgid)
        # Message header
        self.version = version
        self.id = msgid
        self.payload = payload
        self.timing = int(time.time())

        # Message body
        self.body = body
        self._test_payload()

    def payloads(self):
        """

        Returns: The name of the payload

        """
        if self.payload in PAYLOADS:
            return PAYLOADS[self.payload]
        return 'Undefined'

    def _test_payload(self):
        # Test if body matches the given payload
        if not isinstance(self.body, collections.Mapping):
            raise IncorrectBodyError("Body must be a dictonary-like instance")
        if self.payload == 0:
            if 'requested_id' not in self.body or 'ip' not in self.body:
                raise IncorrectBodyError("Payload 0 must have 'requested_id' and 'ip' fields")
        elif self.payload == 1:
            if 'suggested_id' not in self.body:
                raise IncorrectBodyError("Payload 1 must have 'suggested_id' field")
        elif self.payload == 2:
            if 'suggested_id' not in self.body:
                raise IncorrectBodyError("Payload 2 must have 'suggested_id' field")
        elif self.payload == 3:
            if 'dpid' not in self.body or 'action' not in self.body or 'data' not in self.body:
                raise IncorrectBodyError("Payload 3 must have 'dpid', 'action' and 'data' fields")
            self._test_action()

    def _test_action(self):
        action = self.body['action']
        if not isinstance(action, collections.Sequence):
            raise IncorrectActionError("Action must be a list or tuple")
        if len(action) != 2:
            raise IncorrectActionError("Action must be a two term list or tuple")
        if not isinstance(action[0], str):
            raise IncorrectActionError("Action name must be a string")
        if not isinstance(action[1], collections.Mapping):
            raise IncorrectActionError("Action arguments must be a dictionary-like instance")
