"""
    Start File. Reads the configuration and starts the OpenFlow controller
"""


import libs.core.configs


if __name__ == '__main__':
    configs = libs.core.configs.read_configs()
