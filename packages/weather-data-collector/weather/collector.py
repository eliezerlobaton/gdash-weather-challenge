from typing import Any, Dict
import requests
import logging
import time
from datetime import datetime

from ..interfaces.weather_collector import WeatherCollector
from ..interfaces.config_provider import ConfigProviderProtocol


logger = logging.getLogger(__name__)


class OpenMeteoCollector(WeatherCollector):
    def __init__(self, config: ConfigProviderProtocol):
        self.config = config
        self.validate_coordinates()

    def validate_coordinates(self) -> bool:
        if not (-90 <= self.config.LATITUDE <= 90):
            raise ValueError(f"Latitude inválida: {self.config.LATITUDE}")
        if not (-180 <= self.config.LONGITUDE <= 180):
            raise ValueError(f"Longitude inválida: {self.config.LONGITUDE}")
        return True

    def get_weather_data(self) -> Dict[str, Any]:
        max_retries = 3
        retry_delay = 5

        for attempt in range(max_retries):
            try:
                params = self.config.get_weather_params()

                response = requests.get(
                    self.config.OPEN_METEO_URL, params=params, timeout=30
                )
                response.raise_for_status()

                data = response.json()
                current = data["current"]
                hourly = data["hourly"]

                weather_data = {
                    "timestamp": datetime.now().isoformat(),
                    "location": {
                        "city": self.config.CITY,
                        "latitude": self.config.LATITUDE,
                        "longitude": self.config.LONGITUDE,
                    },
                    "current": {
                        "temperature": current["temperature_2m"],
                        "humidity": current["relative_humidity_2m"],
                        "wind_speed": current["wind_speed_10m"],
                        "weather_code": current["weather_code"],
                        "precipitation": current.get("precipitation", 0),
                    },
                    "forecast": {
                        "next_24h_temps": hourly["temperature_2m"][:24],
                        "precipitation_probability": hourly[
                            "precipitation_probability"
                        ][:24],
                    },
                    "source": "open-meteo",
                }

                logger.info(
                    f"Dados obtidos para {self.config.CITY}: {current['temperature_2m']}°C"
                )
                return weather_data
            except ValueError as e:
                logger.error(f"Erro de configuração: {e}")
                raise
            except requests.exceptions.Timeout:
                logger.error(
                    f"Tempo limite de conexão à API de clima (tentativa {attempt + 1})"
                )
                if attempt < max_retries - 1:
                    time.sleep(retry_delay * (attempt + 1))
                else:
                    raise
            except requests.exceptions.ConnectionError:
                logger.error(
                    f"Erro de conexão à API de clima (tentativa {attempt + 1})"
                )
                if attempt < max_retries - 1:
                    time.sleep(retry_delay * (attempt + 1))
                else:
                    raise
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:
                    logger.error("Limite de taxa excedido, aguardando...")
                    time.sleep(60)
                    if attempt < max_retries - 1:
                        continue
                elif e.response.status_code >= 500:
                    logger.error(f"Erro do servidor (tentativa {attempt + 1}: {e})")
                    if attempt < max_retries - 1:
                        continue
                logger.error(f"Erro HTTP: {e}")
                raise
            except KeyError as e:
                logger.error(f"Erro na estrutura de dados do Open-Meteo: {e}")
                raise
            except Exception as e:
                logger.error(f"Erro inesperado (tentativa {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    raise

        raise Exception("Número máximo de tentativas atingido")


def create_weather_collector(
    config: ConfigProviderProtocol, collector_type: str = "open-meteo"
) -> WeatherCollector:
    if collector_type == "open-meteo":
        return OpenMeteoCollector(config)
    else:
        raise ValueError(f"Unknown collector type: {collector_type}")
