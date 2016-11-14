from libs.cal.dataports import DataPorts


def set_actions(action, dt):
    actions = {'switch_config': DataSwitchConfig,
               'error': DataError,
               'msg_received': DataMsgReceived,
               'entry_removed': DataEntryRemoved,
               'modify_entry': DataModifyEntry,
               'get_statistics': DataGetStatistics,
               'send_probe': DataSendProbe}
    try:
        clss = actions[action]
        return clss(dt)
    except ValueError:
        raise ValueError


class DataSwitchConfig:

    def __init__(self, data):
        self._n_tbls = None
        self._caps = None
        self._proto = None
        self._ports = None

        self._instantiate_vars(data)

    def _instantiate_vars(self, data):
        self.n_tbls = data['n_tbls']
        self.caps = data['caps']
        self.proto = data['proto']
        self.ports = DataPorts(data['ports'])

    @property
    def n_tbls(self):
        return self._n_tbls

    @n_tbls.setter
    def n_tbls(self, n_tbls):
        try:
            if 1 <= int(n_tbls) <= 65535:
                self._n_tbls = int(n_tbls)
            else:
                raise ValueError
        except (ValueError, TypeError):
            raise ValueError("Invalid n_tbls: must be int from 1 to 65535")

    @property
    def caps(self):
        return self._caps

    @caps.setter
    def caps(self, caps):
        try:
            if 0 <= int(caps) <= 65535:
                self._caps = int(caps)
            else:
                raise ValueError
        except (ValueError, TypeError):
            raise ValueError("Invalid caps: must be int from 0 to 65535")

    @property
    def proto(self):
        return self._proto

    @proto.setter
    def proto(self, proto):
        try:
            if proto in ['OpenFlow1.0', 'OpenFlow1.3']:
                self._proto = proto
            else:
                raise ValueError
        except ValueError:
            raise ValueError("Invalid proto: must be OpenFlow1.0 or OpenFlow1.3")


class DataMsgReceived:

    def __init__(self, dt):
        pass


class DataEntryRemoved:

    def __init__(self, dt):
        pass


class DataModifyEntry:

    def __init__(self, dt):
        pass


class DataSendProbe:

    def __init__(self, dt):
        pass


class DataError:

    def __init__(self, dt):
        pass


class DataGetStatistics:

    def __init__(self, dt):
        pass
