import { Schema, Document } from 'mongoose';

export interface WeatherLog extends Document {
  timestamp: string;
  location: {
    city: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    weather_code: number;
    precipitation: number;
  };
  forecast?: {
    next_24h_temps: number[];
    precipitation_probability: number[];
  };
  analytics?: {
    temp_min_24h: number;
    temp_max_24h: number;
    temp_avg_24h: number;
    max_precipitation_prob: number;
    avg_precipitation_prob: number;
  };
  condition_classification?: string;
  source: string;
  createdAt: Date;
}

export const WeatherLogSchema = new Schema({
  timestamp: { type: String, required: true },
  location: {
    city: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  current: {
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    wind_speed: { type: Number, required: true },
    weather_code: { type: Number, required: true },
    precipitation: { type: Number, required: true },
  },
  forecast: {
    next_24h_temps: [Number],
    precipitation_probability: [Number],
  },
  analytics: {
    temp_min_24h: Number,
    temp_max_24h: Number,
    temp_avg_24h: Number,
    max_precipitation_prob: Number,
    avg_precipitation_prob: Number,
  },
  condition_classification: String,
  source: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
