// Package models defines the data structures for weather information.
package models

import "fmt"

type WeatherData struct {
	Timestamp string `json:"timestamp"`
	Location  struct {
		City      string  `json:"city"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	} `json:"location"`
	Current struct {
		Temperature   float64 `json:"temperature"`
		Humidity      float64 `json:"humidity"`
		WindSpeed     float64 `json:"wind_speed"`
		WeatherCode   int     `json:"weather_code"`
		Precipitation float64 `json:"precipitation"`
	} `json:"current"`
	Forecast struct {
		Next24HTemps             []float64 `json:"next_24h_temps"`
		PrecipitationProbability []float64 `json:"precipitation_probability"`
	} `json:"forecast"`
	Analytics struct {
		TempMin24H           float64 `json:"temp_min_24h"`
		TempMax24H           float64 `json:"temp_max_24h"`
		TempAvg24H           float64 `json:"temp_avg_24h"`
		MaxPrecipitationProb float64 `json:"max_precipitation_prob"`
		AvgPrecipitationProb float64 `json:"avg_precipitation_prob"`
	} `json:"analytics"`
	ConditionClassification string `json:"condition_classification"`
	Source                  string `json:"source"`
	ProcessedAt             string `json:"processed_at,omitempty"`
}

func (w *WeatherData) Validate() error {
	if w.Location.City == "" {
		return fmt.Errorf("cidade requerida")
	}
	if w.Timestamp == "" {
		return fmt.Errorf("timestamp requerido")
	}
	if w.Current.Temperature < -100 || w.Current.Temperature > 100 {
		return fmt.Errorf("temperatura fora do intervalo válido")
	}
	if w.Current.Humidity < 0 || w.Current.Humidity > 100 {
		return fmt.Errorf("umidade fora do intervalo válido")
	}
	return nil
}
