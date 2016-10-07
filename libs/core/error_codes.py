"""
    This file will host all error codes
    These codes will be used by all events
"""

# Errors associated to the Controller Abstraction Layer
INVALID_MSG = 1
ID_UNAVAILABLE = 2
UNKNOWN_CTR = 3
CTRL_EXCEEDED = 4
UNKNOWN_ID = 5

ERRORS_MSG = {
    INVALID_MSG: 'Invalid Message Received from Controller',
    ID_UNAVAILABLE: 'ID suggested is in use',
    UNKNOWN_CTR: 'Unknown ID and IPP',
    CTRL_EXCEEDED: 'Number of Controllers Exceeded',
    UNKNOWN_ID: 'ID unknown'
}


def print_error(error, id=0, payload=0, ipp=0):
    print(ERRORS_MSG[error])