// Package config provides application configuration loading from environment variables.
package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"gdash-weather-challenge/rabbitmq-worker/internal/interfaces"
)

type Config struct {
	RabbitMQURL string
	QueueName   string
	APIURL      string
	MaxRetries  int
	RetryDelay  time.Duration
}

var _ interfaces.ConfigProvider = (*Config)(nil)

func Load() *Config {
	host := getEnv("RABBITMQ_HOST", "localhost")
	port := getEnv("RABBITMQ_PORT", "5672")
	user := getEnv("RABBITMQ_USER", "guest")
	pass := getEnv("RABBITMQ_PASS", "guest")

	rabbitmqURL := fmt.Sprintf("amqp://%s:%s@%s:%s/", user, pass, host, port)

	maxRetries, _ := strconv.Atoi(getEnv("MAX_RETRIES", "3"))
	retryDelaySeconds, _ := strconv.Atoi(getEnv("RETRY_DELAY_SECONDS", "5"))

	return &Config{
		RabbitMQURL: rabbitmqURL,
		QueueName:   getEnv("RABBITMQ_QUEUE", "weather_data"),
		APIURL:      getEnv("API_URL", "http://localhost:3000"),
		MaxRetries:  maxRetries,
		RetryDelay:  time.Duration(retryDelaySeconds) * time.Second,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func (c *Config) GetRabbitMQURL() string {
	return c.RabbitMQURL
}

func (c *Config) GetQueueName() string {
	return c.QueueName
}

func (c *Config) GetAPIURL() string {
	return c.APIURL
}

func (c *Config) GetMaxRetries() int {
	return c.MaxRetries
}

func (c *Config) GetRetryDelay() time.Duration {
	return c.RetryDelay
}
