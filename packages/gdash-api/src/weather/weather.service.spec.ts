import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { getModelToken } from '@nestjs/mongoose';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

describe('WeatherService', () => {
  let service: WeatherService;
  let mockWeatherModel: any;

  beforeEach(async () => {
    mockWeatherModel = {
      find: jest.fn(),
      countDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken('WeatherLog'),
          useValue: mockWeatherModel,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should create a weather log with classification', async () => {
      const createDto: CreateWeatherLogDto = {
        timestamp: '2024-01-01T00:00:00Z',
        location: { city: 'Test City', latitude: 0, longitude: 0 },
        current: {
          temperature: 25,
          humidity: 60,
          wind_speed: 10,
          weather_code: 1,
          precipitation: 0,
        },
        source: 'test',
      };

      const saveMock = jest.fn().mockResolvedValue({
        ...createDto,
        _id: '1',
        condition_classification: 'agradavel',
      });

      const logInstance = { save: saveMock };
      const MockLogConstructor = jest.fn(() => logInstance) as any;
      const newMockWeatherModel = Object.assign(
        MockLogConstructor,
        mockWeatherModel,
      );

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WeatherService,
          {
            provide: getModelToken('WeatherLog'),
            useValue: newMockWeatherModel,
          },
        ],
      }).compile();

      service = module.get<WeatherService>(WeatherService);

      await service.createLog(createDto);

      expect(newMockWeatherModel).toHaveBeenCalled();
    });

    it('should classify as "chuvoso" when precipitation > 5', () => {
      const createDto: CreateWeatherLogDto = {
        timestamp: '2024-01-01T00:00:00Z',
        location: { city: 'Test', latitude: 0, longitude: 0 },
        current: {
          temperature: 20,
          humidity: 80,
          wind_speed: 10,
          weather_code: 1,
          precipitation: 10,
        },
        source: 'test',
      };

      const classification = service['classifyWeatherCondition'](createDto);
      expect(classification).toBe('chuvoso');
    });

    it('should classify as "quente" when temp > 30', () => {
      const createDto: CreateWeatherLogDto = {
        timestamp: '2024-01-01T00:00:00Z',
        location: { city: 'Test', latitude: 0, longitude: 0 },
        current: {
          temperature: 35,
          humidity: 50,
          wind_speed: 10,
          weather_code: 1,
          precipitation: 0,
        },
        source: 'test',
      };

      const classification = service['classifyWeatherCondition'](createDto);
      expect(classification).toBe('quente');
    });

    it('should classify as "frio" when temp < 10', () => {
      const createDto: CreateWeatherLogDto = {
        timestamp: '2024-01-01T00:00:00Z',
        location: { city: 'Test', latitude: 0, longitude: 0 },
        current: {
          temperature: 5,
          humidity: 50,
          wind_speed: 10,
          weather_code: 1,
          precipitation: 0,
        },
        source: 'test',
      };

      const classification = service['classifyWeatherCondition'](createDto);
      expect(classification).toBe('frio');
    });
  });

  describe('getLogs', () => {
    it('should return paginated logs', async () => {
      const mockLogs = [
        { _id: '1', timestamp: '2024-01-01' },
        { _id: '2', timestamp: '2024-01-02' },
      ];

      const execMock = jest.fn().mockResolvedValue(mockLogs);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });

      (mockWeatherModel.find as jest.Mock).mockReturnValue({ skip: skipMock });

      const result = await service.getLogs(10, 0);

      expect(result).toEqual(mockLogs);
      expect(mockWeatherModel.find).toHaveBeenCalled();
    });
  });

  describe('getTotalLogs', () => {
    it('should return total count of logs', async () => {
      (mockWeatherModel.countDocuments as jest.Mock).mockResolvedValue(42);

      const result = await service.getTotalLogs();

      expect(result).toBe(42);
    });
  });

  describe('exportCSV', () => {
    it('should export logs as CSV format', async () => {
      const mockLogs = [
        {
          timestamp: '2024-01-01',
          location: { city: 'Test City' },
          current: {
            temperature: 20,
            humidity: 50,
            wind_speed: 10,
            weather_code: 1,
          },
          condition_classification: 'agradavel',
          source: 'test',
        },
      ];

      const execMock = jest.fn().mockResolvedValue(mockLogs);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      (mockWeatherModel.find as jest.Mock).mockReturnValue({ sort: sortMock });

      const result = await service.exportCSV();

      expect(result).toContain('timestamp,city,temperature');
      expect(result).toContain('Test City');
    });
  });

  describe('exportXLSX', () => {
    it('should export logs as XLSX buffer', async () => {
      const mockLogs = [
        {
          timestamp: '2024-01-01',
          location: { city: 'Test City' },
          current: {
            temperature: 20,
            humidity: 50,
            wind_speed: 10,
            weather_code: 1,
          },
          condition_classification: 'agradavel',
          source: 'test',
        },
      ];

      const execMock = jest.fn().mockResolvedValue(mockLogs);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      (mockWeatherModel.find as jest.Mock).mockReturnValue({ sort: sortMock });

      const result = await service.exportXLSX();

      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
