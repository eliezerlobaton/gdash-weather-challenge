import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLogSchema } from './schemas/weather-log.schema';
import { WeatherInsightsService } from './weather-insights/weather-insights.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'WeatherLog', schema: WeatherLogSchema },
    ]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherInsightsService],
  exports: [WeatherService, WeatherInsightsService],
})
export class WeatherModule {}
