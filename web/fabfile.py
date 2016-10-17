# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from __future__ import with_statement
from fabric.api import *


def restart_apache_dev():
    sudo("service apache2 restart")


def deploy_dev():
    run('mkdir -p /home/mininet/SDN-LG/')

    put('/projetos/SDN-LG/*.py', '/home/mininet/SDN-LG/')
    put('/projetos/SDN-LG/web/', '/home/mininet/SDN-LG/')

    sudo('cp /home/mininet/SDN-LG/web/templates/*.* /var/www/html/web/templates/')

    sudo('mkdir -p /var/www/html/lib/')
    sudo('cp /home/mininet/SDN-LG/web/html/lib/*.* /var/www/html/lib/')

    sudo('mkdir -p /var/www/html/fonts/')
    sudo('cp /home/mininet/SDN-LG/web/html/fonts/*.* /var/www/html/fonts/')

    # parando o apache para modificar os arquivos do sistema
    sudo("service apache2 restart")

    # removendo os arquivos python binários, para não ter problema com arquivos removidos
    # run("rm -rf /var/lib/sistema/*.pyc")

    # reiniciando o apache
    # sudo("service apache2 start")



"""
 Definição da localização do host
 O usuáriorio deve digitar a senha de acesso.

 Uso:
     fab dev
     fab production
"""
def dev():
    #env.hosts = ['10.0.0.55']
    env.hosts = ['192.168.56.102']

    env.user = 'mininet'

