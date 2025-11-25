from abc import ABC, abstractmethod
from typing import Any, Dict, Protocol


class WeatherCollectorProtocol(Protocol):
    def get_weather_data(self) -> Dict[str, Any]: ...


class WeatherCollector(ABC):
    @abstractmethod
    def get_weather_data(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def validate_coordinates(self) -> bool:
        pass
