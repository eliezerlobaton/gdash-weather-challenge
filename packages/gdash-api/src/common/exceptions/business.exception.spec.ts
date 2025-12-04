import {
  BusinessException,
  InvalidWeatherDataException,
  WeatherDataNotFoundException,
  ExternalApiException,
} from './business.exception';
import { HttpStatus } from '@nestjs/common';

describe('BusinessException', () => {
  it('should be defined', () => {
    const exception = new BusinessException('Test error');
    expect(exception).toBeDefined();
  });

  it('should create exception with custom message and default BAD_REQUEST status', () => {
    const exception = new BusinessException('Test error');
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    const response = exception.getResponse() as any;
    expect(response.message).toBe('Test error');
    expect(response.timestamp).toBeDefined();
  });

  it('should create exception with custom status code', () => {
    const exception = new BusinessException('Not found', HttpStatus.NOT_FOUND);
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('should create exception with error code', () => {
    const exception = new BusinessException(
      'Test error',
      HttpStatus.BAD_REQUEST,
      'TEST_ERROR',
    );
    const response = exception.getResponse() as any;
    expect(response.errorCode).toBe('TEST_ERROR');
  });
});

describe('InvalidWeatherDataException', () => {
  it('should create exception with proper format', () => {
    const exception = new InvalidWeatherDataException('missing temperature');
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    const response = exception.getResponse() as any;
    expect(response.message).toBe('Invalid weather data: missing temperature');
    expect(response.errorCode).toBe('INVALID_WEATHER_DATA');
  });
});

describe('WeatherDataNotFoundException', () => {
  it('should create exception without id', () => {
    const exception = new WeatherDataNotFoundException();
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    const response = exception.getResponse() as any;
    expect(response.message).toContain('not found');
    expect(response.errorCode).toBe('WEATHER_DATA_NOT_FOUND');
  });

  it('should create exception with id', () => {
    const exception = new WeatherDataNotFoundException('123');
    const response = exception.getResponse() as any;
    expect(response.message).toContain('with id 123');
  });
});

describe('ExternalApiException', () => {
  it('should create exception with proper format', () => {
    const exception = new ExternalApiException('API timeout');
    expect(exception.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    const response = exception.getResponse() as any;
    expect(response.message).toBe('External API error: API timeout');
    expect(response.errorCode).toBe('EXTERNAL_API_ERROR');
  });
});
