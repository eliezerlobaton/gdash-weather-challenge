import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CurrentWeatherDto {
  @ApiProperty()
  @IsNumber()
  @Min(-100)
  @Max(100)
  temperature: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  wind_speed: number;

  @ApiProperty()
  @IsNumber()
  weather_code: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  precipitation: number;
}
