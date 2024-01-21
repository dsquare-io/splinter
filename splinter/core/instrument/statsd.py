import logging
import platform
import socket
from typing import Any, Dict, Union

from django.conf import settings

logger = logging.getLogger(__name__)


class Statsd:
    sock = None

    def __init__(self, prefix: str, host: str):
        self.prefix = prefix

        if host:
            parts = host.split(':')
            if len(parts) == 1:
                port = 8125
            else:
                host = parts[0]
                port = int(parts[1])

            try:
                self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                self.sock.connect((host, port))
            except Exception:
                pass

    def gauge(self, name: str, value: Union[int, float], tags: Dict[str, Any] = None):
        self._send(f'{self.prefix}{name}:{value}|g', tags)

    def increment(self, name: str, value: int, sampling_rate=1.0, tags: Dict[str, Any] = None):
        self._send(f'{self.prefix}{name}:{value}|c|@{sampling_rate}', tags)

    def decrement(self, name: str, value: int, sampling_rate=1.0, tags: Dict[str, Any] = None):
        self._send(f'{self.prefix}{name}:-{value}|c|@{sampling_rate}', tags)

    def timestamp(self, name: str, value: Union[int, float], tags: Dict[str, Any] = None):
        self._send(f'{self.prefix}{name}:{value}|ms', tags)

    @staticmethod
    def format_tags(tags: Dict[str, Any]) -> str:
        t = f'|#node:{platform.node()}'
        if tags:
            for key, value in tags.items():
                t = f'{t},{key}:{value}'

        return t

    def _send(self, msg: str, tags: Dict[str, Any]):
        if not self.sock:
            return

        try:
            msg += self.format_tags(tags)
            self.sock.send(msg.encode('ascii'))
        except Exception:
            logger.error('Error sending message to statsd', exc_info=True)


statsd = Statsd(prefix=settings.STATSD_PREFIX, host=settings.STATSD_HOST)
