// Package api provides a client for interacting with external APIs.
package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"gdash-weather-challenge/rabbitmq-worker/config"
	"gdash-weather-challenge/rabbitmq-worker/models"
)

type CircuitBreaker struct {
	failures    int
	maxFailures int
	timeout     time.Duration
	lastFailure time.Time
	state       string
}

type Client struct {
	config         *config.Config
	httpClient     *http.Client
	circuitBreaker *CircuitBreaker
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		circuitBreaker: &CircuitBreaker{
			maxFailures: 5,
			timeout:     60 * time.Second,
			state:       "closed",
		},
	}
}

func (c *Client) SendWeatherData(data *models.WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro serializando dados: %v", err)
	}

	url := fmt.Sprintf("%s/api/weather/logs", c.config.APIURL)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro criando requisição: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "RabbitMQ-Worker/1.0")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro enviando requisição: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API respondeu com status %d", resp.StatusCode)
	}

	return nil
}

func (c *Client) SendWithCircuitBreaker(data *models.WeatherData) error {
	if c.circuitBreaker.state == "open" {
		if time.Since(c.circuitBreaker.lastFailure) < c.circuitBreaker.timeout {
			return fmt.Errorf("circuit breaker aberto - API indisponível")
		}
		c.circuitBreaker.state = "half-open"
	}

	err := c.SendWithRetry(data)
	if err != nil {
		c.circuitBreaker.failures++
		c.circuitBreaker.lastFailure = time.Now()

		if c.circuitBreaker.failures >= c.circuitBreaker.maxFailures {
			c.circuitBreaker.state = "open"
		}
		return err
	}

	c.circuitBreaker.failures = 0
	c.circuitBreaker.state = "closed"
	return nil
}

func (c *Client) SendWithRetry(data *models.WeatherData) error {
	var lastErr error

	for attempt := 1; attempt <= c.config.MaxRetries; attempt++ {
		err := c.SendWeatherData(data)
		if err == nil {
			return nil
		}

		lastErr = err

		if attempt < c.config.MaxRetries {
			backoffDelay := time.Duration(attempt) * c.config.RetryDelay
			time.Sleep(backoffDelay)
		}
	}

	return fmt.Errorf("falhou após %d tentativas: %v", c.config.MaxRetries, lastErr)
}
