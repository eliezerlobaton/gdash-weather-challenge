import os
from typing import Dict, Any


class Config:
    """Configuración del recolector de datos climáticos"""

    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
    RABBITMQ_PORT = os.getenv("RABBITMQ_PORT", "5672")
    RABBITMQ_USER = os.getenv("RABBITMQ_USER")
    RABBITMQ_PASS = os.getenv("RABBITMQ_PASS")
    QUEUE_NAME = os.getenv("RABBITMQ_QUEUE", "weather_data")

    RABBITMQ_URL = (
        f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASS}@{RABBITMQ_HOST}:{RABBITMQ_PORT}/"
    )

    CITY = os.getenv("LOCATION_NAME", "Recife, Brazil")
    LATITUDE = float(os.getenv("LATITUDE", "-8.0542"))
    LONGITUDE = float(os.getenv("LONGITUDE", "-34.8813"))

    INTERVAL_SECONDS = int(os.getenv("COLLECTION_INTERVAL", "300"))

    # APIs
    OPEN_METEO_URL = os.getenv(
        "WEATHER_API_URL", "https://api.open-meteo.com/v1/forecast"
    )

    @classmethod
    def get_weather_params(cls) -> Dict[str, Any]:
        return {
            "latitude": cls.LATITUDE,
            "longitude": cls.LONGITUDE,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "wind_speed_10m",
                "weather_code",
                "precipitation",
            ],
            "hourly": ["temperature_2m", "precipitation_probability"],
            "timezone": "America/Sao_Paulo",
            "forecast_days": 1,
        }
