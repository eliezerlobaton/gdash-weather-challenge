import { CreateWeatherLogDto } from '../dto/create-weather-log.dto';
import { WeatherLog } from '../schemas/weather-log.schema';

export interface WeatherService {
  createLog(weatherData: CreateWeatherLogDto): Promise<WeatherLog>;
  getLogs(limit?: number, skip?: number): Promise<WeatherLog[]>;
  getTotalLogs(): Promise<number>;
  getInsights(): Promise<any>;
  exportCSV(): Promise<string>;
  exportXLSX(): Promise<Buffer>;
}
