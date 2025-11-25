package worker

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"gdash-weather-challenge/rabbitmq-worker/models"
)

type Processor struct{}

func NewProcessor() *Processor {
	return &Processor{}
}

func (p *Processor) ProcessMessage(body []byte) (*models.WeatherData, error) {
	var weatherData models.WeatherData

	if err := json.Unmarshal(body, &weatherData); err != nil {
		return nil, fmt.Errorf("erro desserializando JSON: %v", err)
	}

	if err := weatherData.Validate(); err != nil {
		return nil, fmt.Errorf("dados inválidos: %v", err)
	}

	p.transformWeatherData(&weatherData)

	log.Printf("Mensagem processada - Cidade: %s, Temp: %.1f°C",
		weatherData.Location.City, weatherData.Current.Temperature)

	return &weatherData, nil
}

func (p *Processor) transformWeatherData(data *models.WeatherData) {
	data.ProcessedAt = time.Now().Format(time.RFC3339)

	data.Current.Temperature = roundToDecimal(data.Current.Temperature, 1)
	data.Current.Humidity = roundToDecimal(data.Current.Humidity, 1)
	data.Current.WindSpeed = roundToDecimal(data.Current.WindSpeed, 1)
}

func roundToDecimal(value float64, decimals int) float64 {
	multiplier := 1.0
	for i := 0; i < decimals; i++ {
		multiplier *= 10
	}
	return float64(int(value*multiplier+0.5)) / multiplier
}
