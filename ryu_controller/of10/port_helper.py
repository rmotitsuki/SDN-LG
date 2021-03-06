

def get_port_state(state, config):
    if state == 0 and config == 0:
            return 'up'
    return 'down'


def get_port_speed(curr):
    confs = [1, 2, 4, 8, 16, 32, 64]
    return get_phy_speed(parse_bitmask(curr, confs))


def get_phy_speed(speed):
    bws = {1: '10MB_HD',
           2: '10MB_FD',
           4: '100MB_HD',
           8: '100MB_FD',
           16: '1GB_HD',
           32: '1GB_FD',
           64: '10GB_FD'}
    try:
        return bws[speed[0]]
    except KeyError:
        return 'OtherSpeed(%s)' % speed[0]


def parse_bitmask(bitmask, array):
    size = len(array)
    for i in range(0, size):
        mask = 2 ** i
        aux = bitmask & mask
        if aux == 0:
            array.remove(mask)
    return array
