class OFSwitch13:

    def __init__(self, ev):
        self.obj = ev
        self.dpid = ev.msg.datapath_id
        self.of_version = ev.msg.version
