import threading
import unittest

from sdnlg.libs import Signal, called_on

packet_in = Signal()
port_status = Signal()
list_pkin1 = []
list_pkin2 = []
list_pstatus1 = []
list_thread = []


@called_on(packet_in)
def pkin1(pkt):
    list_pkin1.append(pkt)


@called_on(packet_in, 'one')
def pkin2(pkt):
    list_pkin2.append(pkt)


@called_on(port_status)
def pstatus1(pkt):
    list_pstatus1.append(pkt)


class TestSignals(unittest.TestCase):

    def setUp(self):
        global list_pkin1, list_pkin2, list_pstatus1, list_thread
        list_pkin1 = []
        list_pkin2 = []
        list_pstatus1 = []
        list_thread = []

    def test_signals(self):
        packet_in.send(pkt='First packet')
        packet_in.send(sender='one', pkt='Second packet')
        port_status.send(pkt='Third packet')
        packet_in.send(pkt='Fourth packet')
        port_status.send(sender='two', pkt='Fifth packet')

        self.assertEqual(list_pkin1, ['First packet', 'Second packet', 'Fourth packet'])
        self.assertEqual(list_pkin2, ['Second packet'])
        self.assertEqual(list_pstatus1, ['Third packet', 'Fifth packet'])

    def test_threads(self):

        self.assertEqual(len(list_pkin1), 0)

        def thread_signal():
            packet_in.send(pkt='Thread sent 1')
            packet_in.send(sender='one', pkt='Thread sent 2')

        packet_in.send(pkt='Main sent 1')
        thread = threading.Thread(target=thread_signal)
        thread.start()

        self.assertEqual(list_pkin1, ['Main sent 1', 'Thread sent 1', 'Thread sent 2'])
        self.assertEqual(list_pkin2, ['Thread sent 2'])


if __name__ == '__main__':
    unittest.main()
