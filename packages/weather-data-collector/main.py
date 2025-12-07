import logging
import time

from config import Config
from weather.collector import create_weather_collector
from weather.processors import WeatherProcessor
from messaging.rabbitmq import RabbitMQPublisher
from interfaces.weather_collector import WeatherCollectorProtocol
from interfaces.data_processor import DataProcessorProtocol
from interfaces.message_publisher import MessagePublisherProtocol
from interfaces.config_provider import ConfigProviderProtocol

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class WeatherDataCollector:
    def __init__(
        self,
        config: ConfigProviderProtocol,
        weather_collector: WeatherCollectorProtocol,
        processor: DataProcessorProtocol,
        publisher: MessagePublisherProtocol,
    ):
        self.config = config
        self.weather_collector = weather_collector
        self.processor = processor
        self.publisher = publisher

    def run_collection_cycle(self):
        try:
            logger.info("Iniciando ciclo de coleta de dados climáticos")

            weather_data = self.weather_collector.get_weather_data()

            processed_data = self.processor.process_data(weather_data)

            success = self.publisher.send_message(processed_data)

            if success:
                logger.info("Ciclo de coleta concluído com sucesso")
            else:
                logger.error("Erro no ciclo de coleta")

        except Exception as e:
            logger.error(f"Erro no ciclo de coleta: {e}")

    def run(self):
        """Execute the collector continuously"""
        logger.info(f"Iniciando coletor de dados climáticos para {self.config.CITY}")
        logger.info(
            f"Intervalo: a cada {self.config.INTERVAL_SECONDS} segundos ({self.config.INTERVAL_SECONDS / 60:.1f} minutos)"
        )

        while True:
            try:
                self.run_collection_cycle()

                sleep_seconds = self.config.INTERVAL_SECONDS
                logger.info(
                    f"Aguardando {sleep_seconds} segundos até o próximo ciclo..."
                )
                time.sleep(sleep_seconds)

            except KeyboardInterrupt:
                logger.info("Parando o coletor por interrupção do usuário")
                break
            except Exception as e:
                logger.error(f"Error inesperado: {e}")
                logger.info("Tentando novamente em 5 minutos...")
                time.sleep(300)


def create_collector_with_dependencies() -> WeatherDataCollector:
    config = Config()

    weather_collector = create_weather_collector(config, "open-meteo")
    processor = WeatherProcessor()
    publisher = RabbitMQPublisher(config)

    return WeatherDataCollector(config, weather_collector, processor, publisher)


import os
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

def start_dummy_server():
    port = int(os.environ.get("PORT", 8080))
    server_address = ("", port)
    httpd = HTTPServer(server_address, BaseHTTPRequestHandler)
    logger.info(f"Iniciando servidor HTTP dummy na porta {port}")
    httpd.serve_forever()

def main():
    server_thread = threading.Thread(target=start_dummy_server, daemon=True)
    server_thread.start()

    collector = create_collector_with_dependencies()
    collector.run()


if __name__ == "__main__":
    main()
