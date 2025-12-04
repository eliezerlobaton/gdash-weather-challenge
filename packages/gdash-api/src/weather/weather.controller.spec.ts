import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherInsightsService } from './weather-insights/weather-insights.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: WeatherService;
  let weatherInsightsService: WeatherInsightsService;

  const mockWeatherService = {
    createLog: jest.fn(),
    getLogs: jest.fn(),
    getTotalLogs: jest.fn(),
    exportCSV: jest.fn(),
    exportXLSX: jest.fn(),
  };

  const mockWeatherInsightsService = {
    generateInsights: jest.fn(),
    refreshInsights: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
        {
          provide: WeatherInsightsService,
          useValue: mockWeatherInsightsService,
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
    weatherInsightsService = module.get<WeatherInsightsService>(
      WeatherInsightsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLog', () => {
    it('should create a weather log', async () => {
      const createDto: CreateWeatherLogDto = {
        timestamp: '2024-01-01T00:00:00Z',
        location: { city: 'Test City', latitude: 0, longitude: 0 },
        current: {
          temperature: 20,
          humidity: 50,
          wind_speed: 10,
          weather_code: 1,
          precipitation: 0,
        },
        source: 'test',
      };

      const mockLog = { _id: '1', ...createDto };
      mockWeatherService.createLog.mockResolvedValue(mockLog);

      const result = await controller.createLog(createDto);

      expect(result).toEqual(mockLog);
      expect(weatherService.createLog).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getLogs', () => {
    it('should return paginated logs with metadata', async () => {
      const mockLogs = [{ _id: '1' }, { _id: '2' }];
      mockWeatherService.getLogs.mockResolvedValue(mockLogs);
      mockWeatherService.getTotalLogs.mockResolvedValue(10);

      const result = await controller.getLogs('5', '2');

      expect(result).toEqual({
        data: mockLogs,
        meta: {
          total: 10,
          page: 2,
          limit: 5,
          totalPages: 2,
        },
      });
      expect(weatherService.getLogs).toHaveBeenCalledWith(5, 5);
    });

    it('should use default pagination values', async () => {
      mockWeatherService.getLogs.mockResolvedValue([]);
      mockWeatherService.getTotalLogs.mockResolvedValue(0);

      await controller.getLogs();

      expect(weatherService.getLogs).toHaveBeenCalledWith(100, 0);
    });
  });

  describe('getInsights', () => {
    it('should return weather insights', async () => {
      const mockInsights = { summary: {}, aiInsights: {} };
      mockWeatherInsightsService.generateInsights.mockResolvedValue(
        mockInsights,
      );

      const result = await controller.getInsights();

      expect(result).toEqual(mockInsights);
      expect(weatherInsightsService.generateInsights).toHaveBeenCalled();
    });
  });

  describe('exportCSV', () => {
    it('should export data as CSV', async () => {
      const mockCSV = 'timestamp,city,temperature\n2024-01-01,Test,20';
      mockWeatherService.exportCSV.mockResolvedValue(mockCSV);

      const mockResponse = {
        header: jest.fn(),
        send: jest.fn(),
      };

      await controller.exportCSV(mockResponse as any);

      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockCSV);
    });
  });

  describe('exportXLSX', () => {
    it('should export data as XLSX', async () => {
      const mockBuffer = Buffer.from('test');
      mockWeatherService.exportXLSX.mockResolvedValue(mockBuffer);

      const mockResponse = {
        header: jest.fn(),
        send: jest.fn(),
      };

      await controller.exportXLSX(mockResponse as any);

      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe('refreshInsights', () => {
    it('should refresh insights', async () => {
      const mockRefreshed = { message: 'refreshed', summary: {} };
      mockWeatherInsightsService.refreshInsights.mockResolvedValue(
        mockRefreshed,
      );

      const result = await controller.refreshInsights();

      expect(result).toEqual(mockRefreshed);
      expect(weatherInsightsService.refreshInsights).toHaveBeenCalled();
    });
  });
});
