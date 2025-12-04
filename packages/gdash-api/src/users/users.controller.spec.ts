import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const mockUsers = [
        { _id: '1', name: 'User 1', email: 'user1@example.com' },
        { _id: '2', name: 'User 2', email: 'user2@example.com' },
      ];

      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      const mockUser = {
        _id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };
      const mockCreatedUser = { _id: '1', ...userData };

      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const result = await controller.create(userData);

      expect(result).toEqual(mockCreatedUser);
      expect(usersService.create).toHaveBeenCalledWith(userData);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = { name: 'Updated Name' };
      const mockUpdatedUser = {
        _id: '1',
        name: 'Updated Name',
        email: 'test@example.com',
      };

      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update('1', updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(usersService.update).toHaveBeenCalledWith('1', updateData);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockUsersService.delete.mockResolvedValue(undefined);

      await controller.delete('1');

      expect(usersService.delete).toHaveBeenCalledWith('1');
    });
  });
});
