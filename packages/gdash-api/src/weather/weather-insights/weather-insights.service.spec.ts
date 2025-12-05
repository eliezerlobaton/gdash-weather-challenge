import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WeatherInsightsService } from './weather-insights.service';
import { getModelToken } from '@nestjs/mongoose';

describe('WeatherInsightsService', () => {
  let service: WeatherInsightsService;
  let mockWeatherModel: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockWeatherModel = {
      find: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('fake-gemini-api-key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherInsightsService,
        {
          provide: getModelToken('WeatherLog'),
          useValue: mockWeatherModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<WeatherInsightsService>(WeatherInsightsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateInsights', () => {
    it('should return insufficient data message when no logs', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
      (mockWeatherModel.find as jest.Mock).mockReturnValue({
        limit: limitMock,
      });

      const result = await service.generateInsights();

      expect(result).toEqual({
        message: 'Dados insuficientes para gerar insights',
        totalRecords: 0,
      });
    });

    it('should generate insights with weather data', async () => {
      const mockLogs = Array(48)
        .fill(null)
        .map((_, i) => ({
          current: {
            temperature: 20 + i,
            humidity: 60,
            wind_speed: 10,
          },
          analytics: {
            max_precipitation_prob: 30,
          },
          createdAt: new Date(),
        }));

      const execMock = jest.fn().mockResolvedValue(mockLogs);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
      (mockWeatherModel.find as jest.Mock).mockReturnValue({
        limit: limitMock,
      });

      const result = (await service.generateInsights()) as {
        summary: {
          totalRecords: number;
          averageTemperature: number;
          temperatureTrend: string;
        };
        aiInsights: Record<string, unknown>;
      };

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('aiInsights');
      expect(result.summary).toHaveProperty('totalRecords', 48);
      expect(result.summary).toHaveProperty('averageTemperature');
      expect(result.summary).toHaveProperty('temperatureTrend');
    });

    it('should calculate comfort score correctly', async () => {
      const mockLogs = [
        {
          current: { temperature: 22, humidity: 50, wind_speed: 5 },
          analytics: { max_precipitation_prob: 10 },
        },
      ];

      const execMock = jest.fn().mockResolvedValue(mockLogs);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
      (mockWeatherModel.find as jest.Mock).mockReturnValue({
        limit: limitMock,
      });

      const result = (await service.generateInsights()) as {
        summary: { comfortScore: number };
      };

      expect(result.summary.comfortScore).toBeGreaterThan(80);
    });

    it('should classify weather condition as "muito_quente"', () => {
      const mockLogs = Array(24)
        .fill(null)
        .map(() => ({
          current: { temperature: 40, humidity: 50, wind_speed: 10 },
          analytics: { max_precipitation_prob: 10 },
        }));

      const condition = service['classifyWeatherCondition'](40, 50, mockLogs);
      expect(condition).toBe('muito_quente');
    });

    it('should detect temperature trend as "subindo"', () => {
      const mockLogs = Array(48)
        .fill(null)
        .map((_, i) => ({
          current: { temperature: 20 + (i < 24 ? 2 : 0), humidity: 50 },
        }));

      const trend = service['detectTemperatureTrend'](mockLogs);
      expect(trend).toBe('subindo');
    });

    it('should generate weather alerts for extreme heat', () => {
      const mockLogs = Array(12)
        .fill(null)
        .map(() => ({
          current: { temperature: 40, humidity: 50, wind_speed: 10 },
          analytics: { max_precipitation_prob: 10 },
        }));

      const alerts = service['generateWeatherAlerts'](
        mockLogs,
        40,
        50,
      ) as string[];
      expect(alerts.some((a: string) => a.includes('Calor extremo'))).toBe(
        true,
      );
    });

    it('should detect weather patterns', () => {
      const mockLogs = Array(72)
        .fill(null)
        .map((_, i) => ({
          current: { temperature: 20, humidity: 85, wind_speed: 10 },
          analytics: {
            max_precipitation_prob: i % 2 === 0 ? 70 : 20,
          },
        }));

      const patterns = service['detectWeatherPatterns'](mockLogs);
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should generate textual summary', () => {
      const mockLogs = Array(72)
        .fill(null)
        .map(() => ({
          current: { temperature: 22, humidity: 60 },
        }));

      const summary = service['generateTextualSummary'](
        mockLogs,
        22,
        60,
        'estavel',
        'agradavel',
      );
      expect(summary).toContain('temperatura média');
      expect(summary).toContain('agradável');
    });

    it('should use fallback insights when Gemini fails', async () => {
      const mockLogs = Array(48)
        .fill(null)
        .map(() => ({
          current: { temperature: 25, humidity: 60, wind_speed: 10 },
          analytics: { max_precipitation_prob: 10 },
          timestamp: new Date().toISOString(),
          location: { city: 'Recife' },
        }));

      const execMock = jest.fn().mockResolvedValue(mockLogs);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
      (mockWeatherModel.find as jest.Mock).mockReturnValue({
        limit: limitMock,
      });

      jest
        .spyOn(service['model'], 'generateContent')
        .mockRejectedValue(new Error('Gemini API error'));

      const result = (await service.generateInsights()) as {
        aiInsights: { source: string };
      };

      expect(result.aiInsights.source).toBe('Fallback Analysis');
    });
  });

  describe('refreshInsights', () => {
    it('should refresh and return insights with message', async () => {
      const mockLogs = [
        {
          current: { temperature: 20, humidity: 60, wind_speed: 10 },
          analytics: { max_precipitation_prob: 10 },
        },
      ];

      const execMock = jest.fn().mockResolvedValue(mockLogs);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
      (mockWeatherModel.find as jest.Mock).mockReturnValue({
        limit: limitMock,
      });

      const result = (await service.refreshInsights()) as {
        message: string;
        lastUpdated: string;
      };

      expect(result.message).toBe('Insights atualizados com sucesso');
      expect(result).toHaveProperty('lastUpdated');
    });
  });
});
