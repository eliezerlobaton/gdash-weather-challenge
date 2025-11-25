from abc import ABC, abstractmethod
from typing import Any, Dict, Protocol


class DataProcessorProtocol(Protocol):
    def process_data(self, data: Dict[str, Any]) -> Dict[str, Any]: ...


class DataProcessor(ABC):
    @abstractmethod
    def process_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def _classify_condition(self, data: Dict[str, Any], stats: Dict[str, Any]) -> str:
        pass
