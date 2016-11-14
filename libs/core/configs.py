"""
    Open configuration files and import content of all files into a
    dictionary with sections. Example:
    {
        'database':
        {
            'host': 127.0.0.1,
            'user': root,
            'pass': root
        },
        'modules':
        {
            'snmp': False,
            'monitoring': True,
            'trae': True
        },
        'openflow':
        {
            'version': '1.0',
            'has_ofp_table_support': True,
            'listen_port': 6633
        },
        'sdnlg':
        {
            'ui_port': 8080
            'controller': ryu|odl|onos
        }
        'messagebroker':
        {
            'rabbitmq_host': localhost
            'rabbitmq_port': 5672
        }
    }
"""


CONFIG_PATH = "./conf"


def read_configs():
    """
        Read all core files and generate and dictionary
        Returns:
            configs: dictionary with all configs
    """
    configs = dict(database=read_database_configs(),
                   modules=read_modules_configs(),
                   openflow=read_openflow_configs(),
                   sdnlg=read_sdnlg_configs(),
                   messagebroker=read_messagebroker_configs(),
                   controllers=read_controllers_configs(),
                   snmp=read_snmp_configs())
    return configs


def read_database_configs():
    """
        Read the database core file
        Returns:
            dictionary: database configs
    """
    config_file = CONFIG_PATH + "/database.conf"
    options = ['HOST', 'USER', 'PASS', 'DATABASE']
    dictionary = {'HOST': '127.0.0.1', 'USER': 'root',
                  'PASS': 'root', 'DATABASE': 'sdnlg'}
    return read_file(config_file, options, dictionary)


def read_modules_configs():
    """
        Read the database core file
        Returns:
            dictionary: database configs
    """
    config_file = CONFIG_PATH + "/modules.conf"
    options = ['SNMP', 'MONITORING', 'TRACE']
    dictionary = {'SNMP': 'False', 'MONITORING': 'True',
                  'TRACE': 'True'}
    return read_file(config_file, options, dictionary)


def read_openflow_configs():
    """
        Read the OpenFlow core file
        Return:
            dictionary: openflow configs
    """
    config_file = CONFIG_PATH + "/openflow.conf"
    options = ['VERSION', 'LISTEN_PORT', 'MINIMUM_COOKIE_ID',
               'PACKET_OUT_INTERVAL', 'PUSH_COLORS_INTERVAL',
               'COLLECT_INTERVAL', 'HAS_OFPP_TABLE_SUPPORT',
               'VLAN_DISCOVERY', 'FLOW_PRIORITY']
    dictionary = {'VERSION': '1.0',
                  'LISTEN_PORT': 6633,
                  'MINIMUM_COOKIE_ID': 2000000,
                  'PACKET_OUT_INTERVAL': 5,
                  'PUSH_COLORS_INTERVAL': 10,
                  'COLLECT_INTERVAL': 30,
                  'HAS_OFPP_TABLE_SUPPORT': True,
                  'VLAN_DISCOVERY': 100,
                  'FLOW_PRIORITY': 50000}
    return read_file(config_file, options, dictionary)


def read_sdnlg_configs():
    """
        Read the database core file
        Returns:
            dictionary: database configs
    """
    config_file = CONFIG_PATH + "/sdnlg.conf"
    options = ['REST_PORT', 'CONTROLLER', 'AL_SNIFFER_URL']
    dictionary = {'REST_PORT': 8080, 'CONTROLLER': 'Ryu'}
    return read_file(config_file, options, dictionary)


def read_messagebroker_configs():
    """

        Returns:
            dictionary: Message Broker configs
    """
    config_file = CONFIG_PATH + '/messagebroker.conf'
    options = ['RABBITMQ_HOST', 'RABBITMQ_PORT', 'RABBITMQ_USER', 'RABBITMQ_PASS', 'WAIT_TIME', 'EXCHANGE_CORE',
               'EXCHANGE_CONTROLLERS']
    dictionary = {
        'RABBITMQ_HOST': 'localhost',
        'RABBITMQ_PORT': 5672,
        'RABBITMQ_USER': 'guest',
        'RABBITMQ_PASS': 'guest',
        'WAIT_TIME': 3,
        'EXCHANGE_CORE': 'core',
        'EXCHANGE_CONTROLLERS': 'controllers',
    }
    return read_file(config_file, options, dictionary)


def read_controllers_configs():
    config_file = CONFIG_PATH + '/controllers.conf'
    options = ['CONTROLLERS', ]
    dictionary = {
        'CONTROLLERS': 'ryu,localhost,6633'
    }
    return read_file(config_file, options, dictionary)


def read_snmp_configs():
    config_file = CONFIG_PATH + '/snmp.conf'
    pass


def read_file(config_file, options, dictionary):
    """
        Read core file and return a dictionary with all items
        Args:
            config_file: configuration file
            options: items acceptable in the config_file
            dictionary: default values for items in options
        Return:
            dictionary: items from config_file or options
    """
    line_number = 1
    try:
        f = open(config_file, 'r')
    except Exception as error:
        print(error)
        return dictionary
    for line in f:
        if line[0].isalpha():
            variable, param = line.split('=')
            variable = variable.strip(' ').upper()
            param = param.strip('\n').strip(' ')
            try:
                param = int(param)
            except ValueError:
                pass
            if variable in options:
                dictionary[variable] = param
            else:
                print('Option Invalid: "%s" on file %s:%s' %
                      (variable, config_file, line_number))
        line_number += 1
    return dictionary

