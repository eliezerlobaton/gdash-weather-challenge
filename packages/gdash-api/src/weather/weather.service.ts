import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel('WeatherLog') private weatherModel: Model<WeatherLog>,
  ) {}

  async createLog(data: CreateWeatherLogDto): Promise<WeatherLog> {
    const log = new this.weatherModel({
      ...data,
      createdAt: new Date(),
      condition_classification: this.classifyWeatherCondition(data),
    });
    return await log.save();
  }

  private classifyWeatherCondition(data: CreateWeatherLogDto): string {
    const temp = data.current.temperature;
    const humidity = data.current.humidity;
    const precipitation = data.current.precipitation;

    if (precipitation > 5) return 'chuvoso';
    if (temp > 30) return 'quente';
    if (temp < 10) return 'frio';
    if (humidity > 80) return 'umido';
    return 'agradavel';
  }

  async getLogs(limit: number, skip: number): Promise<WeatherLog[]> {
    return this.weatherModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 })
      .exec();
  }

  async getTotalLogs(): Promise<number> {
    return this.weatherModel.countDocuments();
  }

  async exportCSV(): Promise<string> {
    const logs = await this.weatherModel.find().sort({ timestamp: -1 }).exec();
    const headers =
      'timestamp,city,temperature,humidity,wind_speed,weather_code,condition,source\n';
    const rows = logs
      .map((log) => {
        const condition = log.condition_classification || log.location.city;
        return `${log.timestamp},${log.location.city},${log.current.temperature},${log.current.humidity},${log.current.wind_speed},${log.current.weather_code},${condition},${log.source}`;
      })
      .join('\n');
    return headers + rows;
  }

  async exportXLSX(): Promise<Buffer> {
    const logs = await this.weatherModel.find().sort({ timestamp: -1 }).exec();
    const data = logs.map((log) => ({
      Timestamp: log.timestamp,
      Ciudad: log.location.city,
      Temperatura: log.current.temperature,
      Humedad: log.current.humidity,
      'Velocidad Viento': log.current.wind_speed,
      'Código Clima': log.current.weather_code,
      Condición: log.condition_classification || 'N/A',
      Origen: log.source,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Climáticos');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}
