import sys
from ryu.cmd import manager


sys.argv.append('controllers/ryu_controller/sdnlg_ryu_controller.py')
manager.main()
