"""
    Messages sent/received through the MessageBroker
"""


class Message:

    def __init__(self):
        self.header = self.Header()
        self.body = self.Body()

    def validate_message_format(self, msg):
        if self.validate_header(msg['header']):
            if self.validate_body(msg['body']):
                if self.validate_protocol():
                    return True
        return False

    def validate_header(self, header):
        return True if self.header.process_header(header) else False

    def validate_body(self, body):
        return True if self.body.process_body(body) else False

    def validate_protocol(self):
        return True if self.validate_all_fields() else False

    def validate_all_fields(self):
        if self.header.id == 0:
            # ID negotiation
            if self.header.payload != 0:
                return False
        elif self.header.id in range(1, 254):
            # Communication Established - Payload == 1(Hello) or 3(Update)
            if self.header.payload not in [1, 3]:
                return False
        elif self.header.id == 255:
            # Core ID, can use Payload 1(Hello), 2(Reject) or 3(Update)
            if self.header.payload not in [1, 2, 3]:
                return False
        return True

    class Header:
        """
        """
        def __init__(self):
            self.version = 1
            self.id = 0
            self.payload = 0
            self.timing = 0
            self.ipp = 0

        def _is_valid_version(self):
            if self.version != 1:
                raise ValueError
            return True

        def _is_valid_id(self):
            if not (0 <= self.id <= 255):
                raise ValueError
            return True

        def _is_valid_payload(self):
            if not (0 <= self.payload <= 255):
                raise ValueError
            return True

        def _is_valid_timing(self):
            if not (self.timing >= 0):
                raise ValueError
            return True

        def _is_valid_ipp(self, ipp):

            def check_port(port):
                try:
                    return 1 <= int(port) <= 65535
                except (AttributeError, ValueError, TypeError):
                    return False

            def check_ip(ip):
                try:
                    parts = ip.split('.')
                    return len(parts) == 4 and all(0 <= int(part) < 256 for part in parts)
                except (AttributeError, TypeError, ValueError):
                    return False

            ip, port = ipp.split(':')
            if check_ip(ip) and check_port(port):
                self.ipp = ipp
                return True

            raise ValueError


        def process_header(self, header):

            try:
                self.version = int(header['version'])
                self.id = int(header['id'])
                self.payload = int(header['payload'])
                self.timing = int(header['timing'])
                if(
                   (self._is_valid_version()) and
                   (self._is_valid_id()) and
                   (self._is_valid_payload()) and
                   (self._is_valid_timing()) and
                   (self._is_valid_ipp(header['ipp']))):
                    return True

            except ValueError:
                return False

    class Body:
        """

        """
        def __init__(self):
            self.suggested_id = None

        def process_body(self, body):
            try:
                if 0 < int(body['suggested_id']) <= 255:
                    self.suggested_id = body['suggested_id']
                    return True
                else:
                    raise ValueError

            except (ValueError, TypeError):
                return False
