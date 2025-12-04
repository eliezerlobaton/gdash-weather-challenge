import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('validate', () => {
    it('should return userId and email from payload', () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
      });
    });

    it('should handle different user IDs', () => {
      const payload = { sub: 'different-id', email: 'another@example.com' };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'different-id',
        email: 'another@example.com',
      });
    });
  });
});
