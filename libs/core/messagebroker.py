import dill as pickle
import pika
from libs.core.configs import read_messagebroker_configs

EXCHANGE_TO_CONTROLLERS = 'controllers'
EXCHANGE_TO_CORE = 'core'

confs = read_messagebroker_configs()

RABBITMQ_HOST = confs['RABBITMQ_HOST']
RABBITMQ_PORT = confs['RABBITMQ_PORT']

def send_message(msg, destination='controllers'):
    """

    Args:
        msg: The message to be sent
        destination: The destination of the message (controllers or core). Defaults to controller

    Returns:
        None

    """
    conn = pika.BlockingConnection(pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT
    ))
    channel = conn.channel()
    exchange = EXCHANGE_TO_CONTROLLERS if destination == 'controllers' else EXCHANGE_TO_CORE
    channel.exchange_declare(exchange=exchange, type='fanout')
    serialized = pickle.dumps(msg)

    channel.basic_publish(exchange=exchange, routing_key='', body=serialized)
    conn.close()