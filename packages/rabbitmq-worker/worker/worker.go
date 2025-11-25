// Package worker contains the core logic for the RabbitMQ message consumer.
package worker

import (
	"context"
	"fmt"
	"log"

	"gdash-weather-challenge/rabbitmq-worker/internal/interfaces"

	"github.com/rabbitmq/amqp091-go"
)

type Worker struct {
	config    interfaces.ConfigProvider
	conn      *amqp091.Connection
	ch        *amqp091.Channel
	processor interfaces.MessageProcessor
	apiClient interfaces.APIClient
}

var _ interfaces.MessageConsumer = (*Worker)(nil)

func NewWorker(cfg interfaces.ConfigProvider, processor interfaces.MessageProcessor, apiClient interfaces.APIClient) *Worker {
	return &Worker{
		config:    cfg,
		processor: processor,
		apiClient: apiClient,
	}
}

func (w *Worker) Connect() error {
	var err error

	log.Printf("Conectando ao RabbitMQ: %s", w.config.GetRabbitMQURL())
	w.conn, err = amqp091.Dial(w.config.GetRabbitMQURL())
	if err != nil {
		return fmt.Errorf("erro conectando ao RabbitMQ: %v", err)
	}

	w.ch, err = w.conn.Channel()
	if err != nil {
		return fmt.Errorf("erro criando canal: %v", err)
	}

	err = w.ch.Qos(1, 0, false)
	if err != nil {
		return fmt.Errorf("erro configurando QoS: %v", err)
	}

	if err := w.setupDeadLetterQueue(); err != nil {
		return fmt.Errorf("erro configurando DLQ: %v", err)
	}

	log.Printf("Conectado com sucesso ao RabbitMQ")
	return nil
}

func (w *Worker) setupDeadLetterQueue() error {
	dlqName := w.config.GetQueueName() + "_dlq"

	_, err := w.ch.QueueDeclare(
		dlqName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return fmt.Errorf("erro criando DLQ: %v", err)
	}

	args := amqp091.Table{
		"x-dead-letter-exchange":    "",
		"x-dead-letter-routing-key": dlqName,
		"x-message-ttl":             300000,
	}

	_, err = w.ch.QueueDeclare(
		w.config.GetQueueName(),
		true,
		false,
		false,
		false,
		args,
	)

	return err
}

func (w *Worker) Close() {
	if w.ch != nil {
		w.ch.Close()
	}
	if w.conn != nil {
		w.conn.Close()
	}
}

func (w *Worker) handleMessage(_ context.Context, msg amqp091.Delivery) {
	retryCount := 0
	if headers := msg.Headers; headers != nil {
		if count, ok := headers["x-retry-count"].(int32); ok {
			retryCount = int(count)
		}
	}

	const maxRetries = 3
	if retryCount >= maxRetries {
		log.Printf("Mensagem excedeu o máximo de tentativas, enviando para DLQ")
		msg.Nack(false, false)
		return
	}

	weatherData, err := w.processor.ProcessMessage(msg.Body)
	if err != nil {
		log.Printf("Erro processando mensagem (tentativa %d): %v", retryCount+1, err)
		w.requeueWithRetry(msg, retryCount)
		return
	}

	if err := w.apiClient.SendWithCircuitBreaker(weatherData); err != nil {
		log.Printf("Erro enviando para API (tentativa %d): %v", retryCount+1, err)
		w.requeueWithRetry(msg, retryCount)
		return
	}

	if err := msg.Ack(false); err != nil {
		log.Printf("Erro enviando ACK: %v", err)
	}
}

func (w *Worker) requeueWithRetry(msg amqp091.Delivery, currentRetryCount int) {
	headers := make(amqp091.Table)
	if msg.Headers != nil {
		headers = msg.Headers
	}
	headers["x-retry-count"] = int32(currentRetryCount + 1)

	err := w.ch.Publish(
		"",
		w.config.GetQueueName(),
		false,
		false,
		amqp091.Publishing{
			Headers:      headers,
			ContentType:  "application/json",
			DeliveryMode: amqp091.Persistent,
			Body:         msg.Body,
		},
	)

	if err != nil {
		log.Printf("Erro republicando mensagem: %v", err)
		msg.Nack(false, true)
	} else {
		msg.Ack(false)
	}
}

func (w *Worker) StartConsuming(ctx context.Context) error {
	msgs, err := w.ch.Consume(
		w.config.GetQueueName(),
		"",    // consumer
		false, // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		return fmt.Errorf("erro iniciando consumo: %v", err)
	}

	log.Printf("Worker iniciado. Aguardando mensagens na fila '%s'...", w.config.GetQueueName())

	for {
		select {
		case <-ctx.Done():
			log.Println("Contexto cancelado, interrompendo consumo...")
			return nil
		case msg, ok := <-msgs:
			if !ok {
				log.Println("Canal de mensagens fechado")
				return nil
			}

			log.Printf("Mensagem recebida: %d bytes", len(msg.Body))
			w.handleMessage(ctx, msg)
		}
	}
}
