import pandas as pd
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class WeatherProcessor:
    def process_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            forecast_df = pd.DataFrame(
                {
                    "hour": range(24),
                    "temperature": data["forecast"]["next_24h_temps"],
                    "precipitation_prob": data["forecast"][
                        "precipitation_probability"
                    ],
                }
            )

            stats = {
                "temp_min_24h": float(forecast_df["temperature"].min()),
                "temp_max_24h": float(forecast_df["temperature"].max()),
                "temp_avg_24h": float(forecast_df["temperature"].mean()),
                "max_precipitation_prob": float(
                    forecast_df["precipitation_prob"].max()
                ),
                "avg_precipitation_prob": float(
                    forecast_df["precipitation_prob"].mean()
                ),
            }

            data["analytics"] = stats
            data["condition_classification"] = self._classify_condition(
                data, stats
            )

            logger.info(
                f"Dados processados - Condição: {data['condition_classification']}"
            )
            return data

        except Exception as e:
            logger.error(f"Erro ao processar dados com pandas: {e}")
            return data

    def _classify_condition(
        self, data: Dict[str, Any], stats: Dict[str, Any]
    ) -> str:
        current_temp = data["current"]["temperature"]
        humidity = data["current"]["humidity"]

        if current_temp > 30:
            return "hot"
        elif current_temp < 10:
            return "cold"
        elif humidity > 80:
            return "humid"
        elif stats["max_precipitation_prob"] > 70:
            return "rainy"
        else:
            return "pleasant"
