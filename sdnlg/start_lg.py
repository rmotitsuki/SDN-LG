"""
    Start File. Reads the configuration and starts the OpenFlow controller
"""


import libs.core.configs
from core.core import Core, TopologyDiscovery
from rest.restful import app


if __name__ == '__main__':
    configs = sdnlg.libs.core.configs.read_configs()
    core = Core()
    tp = TopologyDiscovery(core)
    app.run(debug=True, port=5001)
