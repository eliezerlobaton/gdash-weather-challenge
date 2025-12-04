import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CurrentWeatherDto } from './current-weather.dto';
import { LocationDto } from './location.dto';

export class CreateWeatherLogDto {
  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiProperty({ type: LocationDto })
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ type: CurrentWeatherDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CurrentWeatherDto)
  current: CurrentWeatherDto;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  forecast?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  analytics?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  condition_classification?: string;

  @ApiProperty()
  @IsString()
  source: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  processed_at?: string;
}
