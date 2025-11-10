import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, optionalAuthenticate, authorize, AuthRequest } from '../../middleware/auth';
import { createMockRequest, createMockResponse, createMockNext, generateTestToken, testUsers } from '../utils/test-helpers';

jest.mock('jsonwebtoken');

const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should allow request with valid token', () => {
      const user = { id: 1, username: 'admin', role: 'super_admin' };
      const token = generateTestToken(user);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
        Authorization: `Bearer ${token}`,
      };
      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

      (mockJwt.verify as jest.Mock).mockReturnValue(user);

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(user);
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if no token is provided', () => {
      mockRequest.headers = {};

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied. No token provided.',
          statusCode: 401,
        })
      );
    });

    it('should return 401 if token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
        Authorization: 'Bearer invalid-token',
      };
      (mockRequest.header as jest.Mock).mockReturnValue('Bearer invalid-token');

      (mockJwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid token.',
          statusCode: 401,
        })
      );
    });

    it('should handle token without Bearer prefix', () => {
      mockRequest.headers = {
        authorization: 'some-token-without-bearer',
        Authorization: 'some-token-without-bearer',
      };
      (mockRequest.header as jest.Mock).mockReturnValue('some-token-without-bearer');

      (mockJwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid token.',
          statusCode: 401,
        })
      );
    });
  });

  describe('optionalAuthenticate', () => {
    it('should allow request without token (public access)', () => {
      mockRequest.headers = {};

      optionalAuthenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should set user if valid token is provided', () => {
      const user = { id: 1, username: 'admin', role: 'super_admin' };
      const token = generateTestToken(user);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
        Authorization: `Bearer ${token}`,
      };
      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

      (mockJwt.verify as jest.Mock).mockReturnValue(user);

      optionalAuthenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(user);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow request with invalid token (public access)', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (mockJwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuthenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should never block requests', () => {
      mockRequest.headers = {};

      optionalAuthenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('authorize', () => {
    it('should allow super_admin to access all roles', () => {
      mockRequest.user = { id: 1, username: 'admin', role: 'super_admin' };

      const authorizeMiddleware = authorize('clinic_staff', 'super_admin');
      authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow clinic_staff to access clinic_staff and public endpoints', () => {
      mockRequest.user = { id: 2, username: 'staff', role: 'clinic_staff' };

      const authorizeMiddleware = authorize('clinic_staff');
      authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow public to access only public endpoints', () => {
      mockRequest.user = { id: 3, username: 'public', role: 'public' };

      const authorizeMiddleware = authorize('public');
      authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return 403 if public user tries to access clinic_staff endpoint', () => {
      mockRequest.user = { id: 3, username: 'public', role: 'public' };

      const authorizeMiddleware = authorize('clinic_staff', 'super_admin');
      authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied. Insufficient permissions.',
          statusCode: 403,
        })
      );
    });

    it('should return 403 if clinic_staff tries to access super_admin endpoint', () => {
      mockRequest.user = { id: 2, username: 'staff', role: 'clinic_staff' };

      const authorizeMiddleware = authorize('super_admin');
      authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied. Insufficient permissions.',
          statusCode: 403,
        })
      );
    });

    it('should return 401 if user is not authenticated', () => {
      mockRequest.user = undefined;

      const authorizeMiddleware = authorize('public');
      authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied. User not authenticated.',
          statusCode: 401,
        })
      );
    });

    it('should verify hierarchical permissions correctly', () => {
      // super_admin should access clinic_staff endpoint
      mockRequest.user = { id: 1, username: 'admin', role: 'super_admin' };
      const authorizeMiddleware1 = authorize('clinic_staff');
      authorizeMiddleware1(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();

      // clinic_staff should NOT access super_admin endpoint
      mockRequest.user = { id: 2, username: 'staff', role: 'clinic_staff' };
      mockNext = createMockNext();
      const authorizeMiddleware2 = authorize('super_admin');
      authorizeMiddleware2(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });
  });
});

