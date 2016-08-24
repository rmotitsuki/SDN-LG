#!/bin/bash

## 1 - Starts the RabbitMQ
#/etc/init.d/rabbitmq start
#
## 2 - Check conf/sdnlg.conf for the controller to start
#
#CONTROLLER=`grep CONTROLLER ./conf/sdnlg.conf | awk '{print $3}'`
#
#if [ $CONTROLLER -eq 'ryu' ]; do
#    # check configs and change Ryu ports
#    ryu-manager libs/cal/ryu.py
#else:
#    if [ $CONTROLLER -eq 'odl'  ]; do
#        # check configs and change ODL ports
#        start_odl
#     else:
#        # check configs and change ONOS ports
#        start_onos
#     fi

# 3 - Start the SDN-LG

#python start_lg.py