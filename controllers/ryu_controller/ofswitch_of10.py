from ryu.ofproto.ofproto_v1_0_parser import OFPPhyPort
from controllers.ryu_controller.port_helper_of10 import get_port_speed, get_port_state


class OFSwitch10:

    def __init__(self, ev):
        self.obj = ev
        self.dpid = None
        self.version_no = 1
        self.version_name = 'OpenFlow1.0'
        self.n_tbls = None
        self.caps = None
        self.ports = dict()
        # Process SwitchFeatures
        self.process_switch_features()

    def send_to_core(self, action, data):
        body = {'dpid': self.dpid, 'action': action, 'data': data}
        print(body)
        return body

    def switch_config_prepare_and_send(self, ports=dict(), action="added"):
        ports = self.ports if len(ports) is 0 else ports
        action = action if action is not "added" else "added"

        data = {"reason": action,
                "n_tbls": self.n_tbls,
                "caps": self.caps,
                "proto": self.version_name,
                "ports": ports}
        self.send_to_core('switch_config', data)

    def process_switch_features(self):
        self.dpid = self.obj.msg.datapath_id
        self.n_tbls = self.obj.msg.n_tables
        self.caps = self.obj.msg.capabilities
        self.ports = self.extract_ports(self.obj.msg.ports, self.obj.msg.buf)

        self.switch_config_prepare_and_send()

    def extract_ports(self, msg_ports, buf):
        """
            Extract ports from FeatureReply message
            Ports are added to the self.ports
            Returns:
                list of ports found for a specific node
        """
        num_ports = len(msg_ports)
        ofproto = self.obj.msg.datapath.ofproto
        offset = ofproto.OFP_SWITCH_FEATURES_SIZE
        ports = dict()

        for _i in range(num_ports):
            if _i < ofproto.OFPP_MAX:
                port = OFPPhyPort.parser(buf, offset)
                if port.port_no < ofproto.OFPP_MAX:
                    # Check state
                    state = get_port_state(port.state)
                    curr = get_port_speed(port.curr)
                    ports[port.port_no] = {"id": port.port_no,
                                           "name": port.name,
                                           "reason": 'added',
                                           "state": state,
                                           "speed": curr}
                # Todo: convert curr to speed name (10MB to 100G)
                offset += ofproto.OFP_PHY_PORT_SIZE
        return ports

    def process_port_status(self, ev):
        print("EventOFPPortStatus with switch: %s" % self.dpid)
        print(ev.msg)
        # compare to see if port is up or down
        # update self.ports[port_no] with speed and status
        # generate data

        msg = ev.msg
        port_no = msg.desc.port_no

        ofproto = msg.datapath.ofproto
        if msg.reason == ofproto.OFPPR_ADD:
            reason = "added"
        elif msg.reason == ofproto.OFPPR_DELETE:
            reason = "deleted"
        else:
            reason = "modified"

        state = get_port_state(msg.desc.state)
        curr = get_port_speed(msg.desc.curr)

        ports = dict()
        ports[port_no] = {"id": port_no,
                          "name": msg.desc.name,
                          "reason": reason,
                          "state": state,
                          "speed": curr}

        self.switch_config_prepare_and_send(ports=ports, action="modified")

    def process_remove_switch(self, ev):
        print("EventOFPStateChange with switch: %s" % self.dpid)
        # TODO
        # notify SDN-LG that switch was removed
        self.switch_config_prepare_and_send(action="removed")
