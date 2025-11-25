import pika
from pika import exceptions
import json
import logging
import time
from typing import Dict, Any

logger = logging.getLogger(__name__)


class RabbitMQPublisher:
    def __init__(self, config):
        self.config = config

    def send_message(self, data: Dict[str, Any]) -> bool:
        max_retries = 3
        base_retry_delay = 5

        for attempt in range(max_retries):
            connection = None
            try:
                connection = pika.BlockingConnection(
                    pika.URLParameters(self.config.RABBITMQ_URL)
                )
                channel = connection.channel()

                try:
                    channel.queue_declare(queue=self.config.QUEUE_NAME, passive=True)
                except exceptions.ChannelClosedByBroker:
                    connection.close()
                    connection = pika.BlockingConnection(
                        pika.URLParameters(self.config.RABBITMQ_URL)
                    )
                    channel = connection.channel()
                    channel.queue_declare(queue=self.config.QUEUE_NAME, durable=True)

                message = json.dumps(data, ensure_ascii=False)

                channel.basic_publish(
                    exchange="",
                    routing_key=self.config.QUEUE_NAME,
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2, content_type="application/json"
                    ),
                )

                logger.info(
                    f"Dados enviados para o RabbitMQ - Fila: {self.config.QUEUE_NAME}"
                )
                return True

            except exceptions.AMQPConnectionError as e:
                logger.error(
                    f"Erro de conexão com o RabbitMQ (tentativa {attempt + 1}): {e}"
                )
                if attempt < max_retries - 1:
                    retry_delay = base_retry_delay * (2**attempt)  # Backoff exponencial
                    time.sleep(retry_delay)
                else:
                    logger.error("Número máximo de tentativas alcançado para o RabbitMQ")
                    return False
            except exceptions.ChannelWrongStateError as e:
                logger.error(f"Erro de estado do canal (tentativa {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(base_retry_delay)
                else:
                    return False
            except TypeError as e:
                logger.error(f"Erro ao serializar dados para JSON: {e}")
                return False  # No reintentar errores de serialización
            except Exception as e:
                logger.error(
                    f"Erro inesperado ao enviar para o RabbitMQ (tentativa {attempt + 1}): {e}"
                )
                if attempt < max_retries - 1:
                    time.sleep(base_retry_delay)
                else:
                    return False
            finally:
                if connection and not connection.is_closed:
                    try:
                        connection.close()
                    except Exception as e:
                        logger.warning(f"Erro ao fechar conexão com o RabbitMQ: {e}")

        return False
