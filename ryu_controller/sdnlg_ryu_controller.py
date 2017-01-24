from ryu.base import app_manager
from ryu.controller import ofp_event
from ryu.controller.handler import DEAD_DISPATCHER
from ryu.controller.handler import MAIN_DISPATCHER, CONFIG_DISPATCHER
from ryu.controller.handler import set_ev_cls
from ryu.ofproto import ofproto_v1_0, ofproto_v1_3

from ryu_controller import OFSwitch10
from ryu_controller import OFSwitch13


class SDNLG(app_manager.RyuApp):

    OFP_VERSIONS = [ofproto_v1_0.OFP_VERSION, ofproto_v1_3.OFP_VERSION]

    def __init__(self, *args, **kwargs):
        super(SDNLG, self).__init__(*args, **kwargs)
        # Start communication to Core system
        self.msgbroker = self.cal_negotiate_id()
        # Dictionary of Nodes connected indexed by DPID
        self.switches = dict()
        # Run it!
        print("SDN-LG Ryu controller started!")

    def cal_negotiate_id(self):
        # Instantiate the RabbitMQ class

        # Negotiate ID

        #
        return 0

    def instantiate_switch(self, ev):
        if ev.msg.version == 1:
            return OFSwitch10(ev)
        elif ev.msg.version == 4:
            return OFSwitch13(ev)
        else:
            print("OpenFlow version %s is not supported" % ev.msg.version)
            return False

    def add_switch_to_list(self, ev):
        self.switches[ev.msg.datapath_id] = self.instantiate_switch(ev)

    def del_switch_from_list(self, ev):
        self.switches.pop(self.get_switch(ev.datapath))

    def get_switch(self, datapath):
        for dpid, switch in self.switches.items():
            if switch.obj.msg.datapath == datapath:
                return switch.dpid
        return False

    @set_ev_cls(ofp_event.EventOFPSwitchFeatures, CONFIG_DISPATCHER)
    def switch_features_handler(self, ev):
        print("EventOFPSwitchFeatures")
        self.add_switch_to_list(ev)

    @set_ev_cls(ofp_event.EventOFPStateChange, DEAD_DISPATCHER)
    def remove_switch(self, ev):
        print("EventOFPStateChange")
        dpid = self.get_switch(ev.datapath)
        if dpid:
            switch = self.switches[dpid]
            switch.process_remove_switch(ev)
            self.del_switch_from_list(ev)

    @set_ev_cls(ofp_event.EventOFPPortStatus, MAIN_DISPATCHER)
    def port_status(self, ev):
        switch = self.switches[self.get_switch(ev.msg.datapath)]
        switch.process_port_status(ev)

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
