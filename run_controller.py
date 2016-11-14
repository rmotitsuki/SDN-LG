
import sys
from ryu.cmd import manager
from libs.core.configs import read_configs


def start_odl(ip, port):
    print('Starting OpenDayLight on %s:%s' % (ip, port))


def start_onos(ip, port):
    print('Starting ONOS on %s:%s' % (ip, port))


def start_ryu(ip, port):
    print('Starting Ryu on %s:%s' % (ip, port))
    sys.argv.append('controllers/ryu_controller/start_ryu.py')
    manager.main()


def start_controllers(controllers):
    try:
        # TODO: Start each controller as a separated Process
        for controller in controllers.split(';'):
            ctrl, ip, port = controller.split(',')
            eval('start_' + ctrl)(ip, port)
    except ValueError:
        print("controllers.conf file has a wrong syntax")


if __name__ == '__main__':
    configs = read_configs()
    controllers = configs['controllers']['CONTROLLERS']
    start_controllers(controllers)