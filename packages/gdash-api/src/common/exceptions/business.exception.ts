import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly errorCode?: string,
  ) {
    super(
      {
        message,
        errorCode,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

export class InvalidWeatherDataException extends BusinessException {
  constructor(reason: string) {
    super(
      `Invalid weather data: ${reason}`,
      HttpStatus.BAD_REQUEST,
      'INVALID_WEATHER_DATA',
    );
  }
}

export class WeatherDataNotFoundException extends BusinessException {
  constructor(id?: string) {
    super(
      `Weather data ${id ? `with id ${id}` : ''} not found`,
      HttpStatus.NOT_FOUND,
      'WEATHER_DATA_NOT_FOUND',
    );
  }
}

export class ExternalApiException extends BusinessException {
  constructor(message: string) {
    super(
      `External API error: ${message}`,
      HttpStatus.BAD_GATEWAY,
      'EXTERNAL_API_ERROR',
    );
  }
}
