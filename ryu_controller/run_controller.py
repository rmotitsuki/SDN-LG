import sys
from ryu.cmd import manager


verbose = False


def main():
    sys.argv.append('--ofp-tcp-listen-port')
    sys.argv.append('6633')
    sys.argv.append('controllers/ryu_controller/sdnlg_ryu_controller.py')
    if verbose:
        sys.argv.append('--verbose')
        sys.argv.append('--enable-debugger')
    manager.main()

if __name__ == '__main__':
    main()


