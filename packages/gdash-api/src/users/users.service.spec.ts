import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  const mockConfigService = {
    get: jest.fn(
      <T>(key: string, defaultValue?: T): T | undefined => defaultValue,
    ),
  };

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const saveMock = jest.fn().mockResolvedValue({
        _id: '1',
        ...userData,
        password: 'hashedPassword',
      });

      const userInstance = {
        save: saveMock,
      };

      mockUserModel.prototype = userInstance;
      const MockUserConstructor = jest.fn(() => userInstance);
      mockUserModel = Object.assign(MockUserConstructor, mockUserModel);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UsersService,
          {
            provide: getModelToken('User'),
            useValue: mockUserModel,
          },
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      service = module.get<UsersService>(UsersService);

      const result = await service.create(userData);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: userData.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw ConflictException if email already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue({ email: userData.email });

      await expect(service.create(userData)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all users without password', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@example.com' },
        { _id: '2', name: 'User 2', email: 'user2@example.com' },
      ];

      const selectMock = {
        exec: jest.fn().mockResolvedValue(mockUsers),
      };

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue(selectMock),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        _id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      const selectMock = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue(selectMock),
      });

      const result = await service.findById('1');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const selectMock = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue(selectMock),
      });

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update user and hash password if provided', async () => {
      const updateData = { name: 'Updated Name', password: 'newpass' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPass');

      const mockUpdatedUser = {
        _id: '1',
        name: 'Updated Name',
        email: 'test@example.com',
      };

      const selectMock = {
        exec: jest.fn().mockResolvedValue(mockUpdatedUser),
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue(selectMock),
      });

      const result = await service.update('1', updateData);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const selectMock = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue(selectMock),
      });

      await expect(service.update('999', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete user by id', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(undefined);

      await service.delete('1');

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });
  });
});
