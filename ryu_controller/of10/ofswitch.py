from ryu.ofproto.ofproto_v1_0_parser import OFPPhyPort

from ryu_controller.of10.port_helper import get_port_speed, get_port_state


class OFSwitch10:

    def __init__(self, ev):
        self.obj = ev
        self.dpid = str(self.obj.msg.datapath_id)
        self.version_no = 1
        # data struct to keep the switch configuration
        self.switch_conf = dict()
        self.body_data = None
        self.create_switch_config()

    def send_to_core(self, action, data):
        self.body_data = {'dpid': self.dpid, 'action': action, 'data': data}

    def create_switch_config(self):
        self.switch_conf['proto'] = 'OpenFlow1.0'
        self.switch_conf['reason'] = 'added'
        self.switch_conf['n_tbls'] = self.obj.msg.n_tables
        self.switch_conf['caps'] = self.obj.msg.capabilities
        ports = self.extract_ports(self.obj.msg.ports, self.obj.msg.buf)
        self.switch_conf['ports'] = ports
        self.send_to_core('switch_config', self.switch_conf)

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
                    curr = get_port_speed(port.curr)
                    state = get_port_state(port.state, port.config)
                    ports[port.port_no] = {"port_no": port.port_no,
                                           "name": port.name,
                                           "reason": 'added',
                                           "state": state,
                                           "speed": curr}
                offset += ofproto.OFP_PHY_PORT_SIZE
        return ports

    def process_port_status(self, ev):
        msg = ev.msg
        port_no = msg.desc.port_no
        ofproto = msg.datapath.ofproto
        if msg.reason == ofproto.OFPPR_ADD:
            reason = "added"
        elif msg.reason == ofproto.OFPPR_DELETE:
            reason = "deleted"
        else:
            reason = "modified"
        state = get_port_state(msg.desc.state, msg.desc.config)
        curr = get_port_speed(msg.desc.curr)
        port = {"id": port_no, "name": msg.desc.name, "reason": reason,
                "state": state, "speed": curr}
        self.switch_conf['ports'][port_no] = port
        self.switch_conf['reason'] = "modified"
        self.send_to_core('switch_config', self.switch_conf)

    def process_remove_switch(self):
        self.switch_conf['reason'] = "removed"
        self.send_to_core('switch_config', self.switch_conf)

    def process_packet_in(self, pkt_in):
        msg = dict()

        self.send_to_core('msg_received', msg)
