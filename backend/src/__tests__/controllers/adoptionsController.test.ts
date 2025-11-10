import { Request, Response, NextFunction } from 'express';
import { getAdoptions, getAdoptionById, createAdoption, updateAdoption, deleteAdoption } from '../../controllers/adoptionsController';
import { db } from '../../db/connection';
import { AuthRequest } from '../../middleware/auth';
import { createMockRequest, createMockResponse, createMockNext, createAuthenticatedRequest, testUsers, testAdoptions } from '../utils/test-helpers';

jest.mock('../../db/connection');

const mockDb = db as jest.Mocked<typeof db>;

describe('Adoptions Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
    jest.clearAllMocks();
  });

  describe('getAdoptions', () => {
    it('should return all adoptions with user data (public access)', async () => {
      const mockAdoptions = [
        {
          adoption: { id: 1, ...testAdoptions.completed },
          cat: { id: 1, name: 'Fluffy' },
          user: {
            id: 3,
            name: 'Public User',
            email: 'public@test.com',
            phone: '1234567892',
          },
        },
      ];

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockResolvedValue(mockAdoptions),
          }),
        }),
      });

      await getAdoptions(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAdoptions,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return empty array when no adoptions exist', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await getAdoptions(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });
  });

  describe('getAdoptionById', () => {
    it('should return adoption with valid ID and user data', async () => {
      const mockAdoption = {
        adoption: { id: 1, ...testAdoptions.completed },
        cat: { id: 1, name: 'Fluffy' },
        user: {
          id: 3,
          name: 'Public User',
          email: 'public@test.com',
        },
      };

      mockRequest.params = { id: '1' };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([mockAdoption]),
              }),
            }),
          }),
        }),
      });

      await getAdoptionById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAdoption,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when adoption not found', async () => {
      mockRequest.params = { id: '999' };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      await getAdoptionById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Adoption not found',
          statusCode: 404,
        })
      );
    });

  });

  describe('createAdoption', () => {
    it('should successfully create an adoption', async () => {
      const newAdoption = {
        id: 1,
        ...testAdoptions.completed,
      };

      mockRequest.body = testAdoptions.completed;

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newAdoption]),
        }),
      });

      await createAdoption(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: newAdoption,
      });
    });

    it('should handle paired adoptions (adopted_with)', async () => {
      const adoptionData = {
        ...testAdoptions.completed,
        adoptedWith: 2, // Another cat ID
      };

      const newAdoption = {
        id: 1,
        ...adoptionData,
      };

      mockRequest.body = adoptionData;

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newAdoption]),
        }),
      });

      await createAdoption(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateAdoption', () => {
    it('should successfully update an adoption', async () => {
      const updatedAdoption = {
        id: 1,
        ...testAdoptions.completed,
        status: 'completed' as const,
        notes: 'Updated notes',
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { notes: 'Updated notes' };
      mockRequest.user = { id: 2, username: 'staff', role: 'clinic_staff' };

      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedAdoption]),
          }),
        }),
      });

      await updateAdoption(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedAdoption,
      });
    });

    it('should return 404 when adoption not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { notes: 'Updated notes' };

      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await updateAdoption(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Adoption not found',
          statusCode: 404,
        })
      );
    });
  });

  describe('deleteAdoption', () => {
    it('should successfully delete an adoption', async () => {
      const deletedAdoption = { id: 1, ...testAdoptions.completed };

      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 1, username: 'admin', role: 'super_admin' };

      (mockDb.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([deletedAdoption]),
        }),
      });

      await deleteAdoption(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: deletedAdoption,
      });
    });

    it('should return 404 when adoption not found', async () => {
      mockRequest.params = { id: '999' };

      (mockDb.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      await deleteAdoption(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Adoption not found',
          statusCode: 404,
        })
      );
    });
  });
});

