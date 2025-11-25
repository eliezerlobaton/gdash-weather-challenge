from abc import ABC, abstractmethod
from typing import Any, Dict, Protocol


class MessagePublisherProtocol(Protocol):
    def send_message(self, data: Dict[str, Any]) -> bool: ...


class MessagePublisher(ABC):
    @abstractmethod
    def send_message(self, data: Dict[str, Any]) -> bool:
        pass

    @abstractmethod
    def _establish_connection(self):
        pass
