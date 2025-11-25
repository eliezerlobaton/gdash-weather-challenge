from abc import ABC, abstractmethod
from typing import Any, Dict, Protocol


class ConfigProviderProtocol(Protocol):
    @property
    def RABBITMQ_URL(self) -> str: ...

    @property
    def QUEUE_NAME(self) -> str: ...

    @property
    def CITY(self) -> str: ...

    @property
    def LATITUDE(self) -> float: ...

    @property
    def LONGITUDE(self) -> float: ...

    @property
    def INTERVAL_SECONDS(self) -> int: ...

    @property
    def OPEN_METEO_URL(self) -> str: ...

    def get_weather_params(self) -> Dict[str, Any]: ...


class ConfigProvider(ABC):
    @property
    @abstractmethod
    def RABBITMQ_URL(self) -> str:
        pass

    @property
    @abstractmethod
    def QUEUE_NAME(self) -> str:
        pass

    @property
    @abstractmethod
    def OPEN_METEO_URL(self) -> str:
        pass

    @abstractmethod
    def get_weather_params(self) -> Dict[str, Any]:
        pass
