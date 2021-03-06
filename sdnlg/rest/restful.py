import json
from flask import Flask
from flask_restful import reqparse, abort, Api, Resource

from sdnlg.core.core import Core

app = Flask(__name__)
api = Api(app)


# Returns the list of switches
class Switches(Resource):
    def get(self):
        core = Core()
        print('Switch.get {}'.format(repr(core)))
        returns = []
        for s in core.switches:
            returns.append({'dpid': s.dpid, 'capabilities': s.capabilities, 'n_tables': s.n_tables,
                            'n_ports': len(s.ports)})
        return returns


# Returns the list of ports from a switch
class Ports(Resource):
    def get(self, dpid):
        core = Core()
        returns = []
        s = core.switch_exists(dpid)
        if not s:
            return json.dumps([])
        for p in s.ports:
            returns.append({'port_no': p.port_no, 'name': p.name, 'speed': p.speed, 'uptime': p.uptime})
        return returns


# Returns the list of links
class Links(Resource):
    def get(self):
        core = Core()
        returns = []
        for p1, p2 in core.links:
            returns.append({'node1': {'dpid': p1.node.dpid, 'port': {'port_no': p1.port_no, 'name': p1.name}},
                            'node2': {'dpid': p2.node.dpid, 'port': {'port_no': p2.port_no, 'name': p2.name}},
                            'speed': p1.speed})
        return returns


api.add_resource(Switches, '/switches')
api.add_resource(Ports, '/switches/<dpid>/ports')
api.add_resource(Links, '/links')
