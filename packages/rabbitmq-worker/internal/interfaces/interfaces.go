// Package interfaces defines common interfaces used across the rabbitmq-worker application.
package interfaces

import (
	"context"
	"time"

	"gdash-weather-challenge/rabbitmq-worker/models"
)

type ConfigProvider interface {
	GetRabbitMQURL() string
	GetQueueName() string
	GetAPIURL() string
	GetMaxRetries() int
	GetRetryDelay() time.Duration
}

type MessageProcessor interface {
	ProcessMessage(body []byte) (*models.WeatherData, error)
}

type APIClient interface {
	SendWeatherData(data *models.WeatherData) error
	SendWithRetry(data *models.WeatherData) error
	SendWithCircuitBreaker(data *models.WeatherData) error
}

type MessageConsumer interface {
	Connect() error
	StartConsuming(ctx context.Context) error
	Close()
}

