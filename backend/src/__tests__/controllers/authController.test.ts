import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login, register } from '../../controllers/authController';
import { db } from '../../db/connection';
import { users } from '../../db/schema';
import { createMockRequest, createMockResponse, createMockNext, testUsers } from '../utils/test-helpers';

// Mock dependencies
jest.mock('../../db/connection');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockDb = db as jest.Mocked<typeof db>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const userData = {
        id: 1,
        username: 'admin',
        password: 'hashedPassword',
        name: 'Admin',
        email: 'admin@test.com',
        phone: '1234567890',
        role: 'super_admin',
      };

      mockRequest.body = { username: 'admin', password: 'admin' };
      
      // Mock database query
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([userData]),
          }),
        }),
      });

      // Mock bcrypt compare
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock JWT sign
      (mockJwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: userData.id,
            username: userData.username,
            role: userData.role,
          },
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if username is missing', async () => {
      mockRequest.body = { password: 'admin' };

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Username and password are required',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if password is missing', async () => {
      mockRequest.body = { username: 'admin' };

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Username and password are required',
          statusCode: 400,
        })
      );
    });

    it('should return 401 if user does not exist', async () => {
      mockRequest.body = { username: 'nonexistent', password: 'password' };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials',
          statusCode: 401,
        })
      );
    });

    it('should return 401 if password is incorrect', async () => {
      const userData = {
        id: 1,
        username: 'admin',
        password: 'hashedPassword',
        name: 'Admin',
        email: 'admin@test.com',
        phone: '1234567890',
        role: 'super_admin',
      };

      mockRequest.body = { username: 'admin', password: 'wrongpassword' };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([userData]),
          }),
        }),
      });

      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials',
          statusCode: 401,
        })
      );
    });

    it('should generate JWT token with correct payload', async () => {
      const userData = {
        id: 1,
        username: 'admin',
        password: 'hashedPassword',
        name: 'Admin',
        email: 'admin@test.com',
        phone: '1234567890',
        role: 'super_admin',
      };

      mockRequest.body = { username: 'admin', password: 'admin' };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([userData]),
          }),
        }),
      });

      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue('mock-token');

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: 1, username: 'admin', role: 'super_admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const newUser = {
        id: 4,
        name: 'New User',
        username: 'newuser',
        password: 'hashedPassword',
        email: 'newuser@test.com',
        phone: '1234567893',
        role: 'public',
      };

      mockRequest.body = {
        name: 'New User',
        username: 'newuser',
        password: 'password123',
        email: 'newuser@test.com',
        phone: '1234567893',
        role: 'public',
      };

      // Mock check for existing user (returns empty)
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Mock password hashing
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Mock user insertion
      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newUser]),
        }),
      });

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
          },
        },
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = {
        username: 'newuser',
        password: 'password123',
        // Missing name, email, phone
      };

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Name, username, password, email, and phone are required',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if username already exists', async () => {
      const existingUser = {
        id: 1,
        username: 'existing',
        password: 'hashed',
        name: 'Existing',
        email: 'existing@test.com',
        phone: '1234567890',
        role: 'public',
      };

      mockRequest.body = {
        name: 'New User',
        username: 'existing',
        password: 'password123',
        email: 'newuser@test.com',
        phone: '1234567893',
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([existingUser]),
          }),
        }),
      });

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Username already exists',
          statusCode: 400,
        })
      );
    });

    it('should default role to public if not provided', async () => {
      const newUser = {
        id: 4,
        name: 'New User',
        username: 'newuser',
        password: 'hashedPassword',
        email: 'newuser@test.com',
        phone: '1234567893',
        role: 'public',
      };

      mockRequest.body = {
        name: 'New User',
        username: 'newuser',
        password: 'password123',
        email: 'newuser@test.com',
        phone: '1234567893',
        // role not provided
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newUser]),
        }),
      });

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockDb.insert).toHaveBeenCalled();
      const insertCall = (mockDb.insert as jest.Mock).mock.results[0].value;
      const valuesCall = insertCall.values.mock.results[0].value;
      expect(valuesCall.returning).toHaveBeenCalled();
    });
  });
});

