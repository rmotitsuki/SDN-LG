from ryu.base import app_manager
from ryu.controller import ofp_event
from ryu.controller.handler import DEAD_DISPATCHER
from ryu.controller.handler import MAIN_DISPATCHER, CONFIG_DISPATCHER
from ryu.controller.handler import set_ev_cls
from ryu.ofproto import ofproto_v1_0, ofproto_v1_3

from ryu_controller.of10.ofswitch import OFSwitch10
from ryu_controller.of13.ofswitch import OFSwitch13
from shared.message_cal import Message
from shared.messagebroker import MessageBroker


class MyBroker(object):

    def __init__(self):
        def listener_core(msg):
            print(msg)

        self.mb = MessageBroker(listener_core, controller=False)
        self.message = dict()
        self.header = {"version": 1, "id": 1, "payload": 3,
                       "timing": 1, "ipp": "192.168.56.1:6633"}
        self.message['header'] = self.header

    def notify_core(self, msg):
        self.message['body'] = msg
        to_send = Message(self.message)
        print("Send to RMQ: \nMsg: %s \nMessage: %s" % (msg, to_send.__dict__))
        self.mb.send_message(to_send)


class RyuController(app_manager.RyuApp):

    OFP_VERSIONS = [ofproto_v1_0.OFP_VERSION, ofproto_v1_3.OFP_VERSION]

    def __init__(self, *args, **kwargs):
        super(RyuController, self).__init__(*args, **kwargs)
        self.switches = dict()
        self.mbroker = MyBroker()
        print("SDN-LG Ryu controller started!")

    def instantiate_switch(self, ev):
        if ev.msg.version == 1:
            return OFSwitch10(ev)
        elif ev.msg.version == 4:
            return OFSwitch13(ev)
        return False

    def add_switch(self, ev):
        self.switches[ev.msg.datapath_id] = self.instantiate_switch(ev)
        self.mbroker.notify_core(self.switches[ev.msg.datapath_id].body_data)

    def del_switch(self, ev):
        dpid = self.get_switch(ev.datapath)
        if dpid:
            switch = self.switches[dpid]
            switch.process_remove_switch()
            self.mbroker.notify_core(switch.body_data)
            self.switches.pop(self.get_switch(ev.datapath))

    def get_switch(self, datapath):
        for dpid, switch in self.switches.items():
            if switch.obj.msg.datapath == datapath:
                return int(switch.dpid)
        return False

    @set_ev_cls(ofp_event.EventOFPSwitchFeatures, CONFIG_DISPATCHER)
    def switch_features_handler(self, ev):
        self.add_switch(ev)

    @set_ev_cls(ofp_event.EventOFPStateChange, DEAD_DISPATCHER)
    def remove_switch(self, ev):
        self.del_switch(ev)

    @set_ev_cls(ofp_event.EventOFPPortStatus, MAIN_DISPATCHER)
    def port_status(self, ev):
        switch = self.switches[self.get_switch(ev.msg.datapath)]
        switch.process_port_status(ev)
        self.mbroker.notify_core(switch.body_data)

    @set_ev_cls(ofp_event.EventOFPFlowRemoved, MAIN_DISPATCHER)
    def flow_removed(self, ev):
        print("EventOFPFlowRemoved")

    @set_ev_cls(ofp_event.EventOFPFlowStatsReply, MAIN_DISPATCHER)
    def flow_stats_reply(self, ev):
        print("EventOFPFlowStatsReply")
        print(ev.msg)

    @set_ev_cls(ofp_event.EventOFPPacketIn, MAIN_DISPATCHER)
    def packet_in_handler(self, ev):
        print("EventOFPPacketIn")
        print(ev.msg)

    @set_ev_cls(ofp_event.EventOFPErrorMsg, MAIN_DISPATCHER)
    def openflow_error(self, ev):
        print("EventOFPErrorMsg")
        print(ev.msg)

    @staticmethod
    def send_packet_out(node, port, data, lldp=False):
        pass

    @staticmethod
    def send_stat_req(node):
        pass

    @staticmethod
    def push_flow(datapath, cookie, priority, command, match, actions, flags=1):
        pass