
import libs.core.rabbitmq as amqp


class SdnlgController(object):

    def __init__(self, configs):
        self.configs = configs
        self.amqp = amqp.MessagePublisher(configs['sdnlg'])

    def run(self):
        msg = 'hello'
        self.amqp.publish(msg)
        pass