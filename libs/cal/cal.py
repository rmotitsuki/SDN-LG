"""
    Start the CAL module
"""
import time
import dill as pickle
from libs.core.messagebroker import MessageBroker
from libs.core.error_codes import *
from libs.cal.message import Message
from libs.core.debug import debugclass


# Possible Payloads
ID_NEGOTIATION = 0
HELLO = 1
REJECT = 2
UPDATE = 3
# Variables
FIRST_ID = 1
LAST_ID = 254
CORE_ID = 255


@debugclass
class CoreCal:
    """
        This is the Core side of the Controller Abstraction Layer

        table_id = { ID: {'ipp': ipp, 'status':['Reserved'|'Assigned']}

    """
    def __init__(self):
        self.my_id = CORE_ID
        self.table_id = dict()
        self.message = None
        self.hello_queue = list()

        def process_incoming_message(msg_recv):
            """
                Process message received from MessageBroker
                Args:
                    data = message received
                Returns
                    only errors from libs.core.error_codes
            """
            self.message = msg_recv
            if not self.message.validate_message_format():
                return INVALID_MSG
            if self.message.header.id in [ID_NEGOTIATION, HELLO, REJECT]:
                status = self.start_negotiation()
                if status is not True:
                    print_error(status)
                    self.reject_msg(status)
            else:
                self.process_update()

        self.amqp = MessageBroker(process_incoming_message, False)

    def start_negotiation(self):
        """
            Start the ID negotiation, populates the self.table_id dictionary
        """
        if self.message.header.id == ID_NEGOTIATION:
            # ID = 0 --> Id request
            self.establish_connection()
        else:
            # ID = [1-254] - Remote Ctrl accepted the ID
            self.confirm_connection()

        return True

    def establish_connection(self):

        if self.message.header.payload == ID_NEGOTIATION:
            # P = 0 - Ctrl needs an id
            if self.query_id(self.message.body.suggested_id) is ID_UNAVAILABLE:
                # ID suggested by ctrl is no good
                self.suggest_new_id()
            else:
                # Id suggested by ctrl is good
                self.reserve_id()
                self.reply_request(self.message.body.suggested_id)

    def suggest_new_id(self):
        new_id = self.request_id()
        self.reserve_id(new_id)
        self.reply_request(new_id, REJECT)

    def confirm_connection(self):
        if self.validate_controller():
            # This ID was suggested before by the controller
            if not self.is_keepalive():
                # It is a confirmation. Accept the suggested_id
                if not self.confirm_id(self.message.header.id):
                    return UNKNOWN_ID
                # Neighborhood established, start hello to test liveness
                self.hello_queue.append(self.message.header.id)
                self.for_unittest = True
        else:
            #  This ID is not recognized by the Core
            # Force renegotiation?
            self.reject_id()
            return UNKNOWN_CTR

    def is_keepalive(self):
        if self.message.header.payload == HELLO:
            if self.message.body.suggested_id == 0:
                return True
            return False

    def query_id(self, rid):
        if rid in self.table_id:
            return ID_UNAVAILABLE
        return True

    def request_id(self):
        for rid in range(FIRST_ID, LAST_ID):
            if self.query_id(rid) is not ID_UNAVAILABLE:
                return rid
        return CTRL_EXCEEDED

    def reserve_id(self, rid=0):
        my_id = rid
        if my_id != 0:
            self.message.header.id = rid
        if self.message.header.id == 0:
            my_id = self.request_id()
        self.table_id[my_id] = {'ipp': self.message.header.ipp,
                                'status': 'Reserved'}

    def confirm_id(self, rid):
        if self.query_id(rid) and self.table_id[rid]['status'] == 'Reserved':
            self.table_id[rid]['status'] = 'Assigned'
            return True
        else:
            return False

    def reply_request(self, rid, payload=0):
        data = {'suggested_id': rid}
        action = payload if payload != 0 else HELLO
        self.send_msg(self.my_id, action, data)

    def validate_controller(self):
        rid = self.message.header.id
        ipp = self.message.header.ipp
        if rid in self.table_id and self.table_id[rid]['ipp'] == ipp:
            if self.table_id[rid]['status'] is 'Reserved':
                return True
            else:
                self.reject_id()
                return False
        return False

    def reject_id(self):
        # del (ID, IPP) from self.table_id
        data = dict(suggested_id=self.request_id())
        self.send_msg(self.message.header.id, REJECT, data)

    def send_msg(self, rid, payload, data):
        header = {"version": 1, "id": rid, "payload": payload,
                  "timing": 100, "ipp": "192.168.56.3:6111"}
        self.for_unittest = {"header": header, "body": data}
        print(self.for_unittest)
        return self.amqp.send_message(self.for_unittest)

    def keepalive(self):
        # thread for hello
        pass

    # P = 3 ==> updates...
    def process_update(self):
        pass


class ControllerCal:
    """
        This is the Controller/Client side of the Controller Abstraction Layer
    """
    def __init__(self):
        pass
