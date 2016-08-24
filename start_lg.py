"""
    Start File. Reads the configuration and starts the OpenFlow controller
"""


import libs.core.configs
import libs.cal
import core.core


if __name__ == '__main__':
    configs = libs.core.configs.read_configs()
    sdnlg = core.core.SdnlgController(configs)
    sdnlg.run()