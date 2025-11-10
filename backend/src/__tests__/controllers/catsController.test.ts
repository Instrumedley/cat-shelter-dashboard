import { Request, Response, NextFunction } from 'express';
import { getCats, getCatById, createCat, updateCat, deleteCat } from '../../controllers/catsController';
import { db } from '../../db/connection';
import { AuthRequest } from '../../middleware/auth';
import { createMockRequest, createMockResponse, createMockNext, createAuthenticatedRequest, testUsers, testCats } from '../utils/test-helpers';

jest.mock('../../db/connection');

const mockDb = db as jest.Mocked<typeof db>;

describe('Cats Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
    jest.clearAllMocks();
  });

  describe('getCats', () => {
    it('should return all cats (public access)', async () => {
      const mockCats = [
        { id: 1, ...testCats.available },
        { id: 2, ...testCats.booked },
      ];

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValue(mockCats),
      });

      await getCats(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCats,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return empty array when no cats exist', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
      });

      await getCats(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });
  });

  describe('getCatById', () => {
    it('should return cat with valid ID', async () => {
      const mockCat = { id: 1, ...testCats.available };

      mockRequest.params = { id: '1' };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockCat]),
          }),
        }),
      });

      await getCatById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCat,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 when cat not found', async () => {
      mockRequest.params = { id: '999' };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await getCatById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cat not found',
          statusCode: 404,
        })
      );
    });

    it('should return 404 when ID is invalid (parseInt returns NaN)', async () => {
      mockRequest.params = { id: 'invalid' };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await getCatById(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cat not found',
          statusCode: 404,
        })
      );
    });
  });

  describe('createCat', () => {
    it('should successfully create a cat', async () => {
      const newCat = {
        id: 1,
        ...testCats.available,
      };

      mockRequest.body = testCats.available;
      mockRequest.user = { id: 2, username: 'staff', role: 'clinic_staff' };

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newCat]),
        }),
      });

      await createCat(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: newCat,
      });
    });

    it('should handle default values', async () => {
      const catData = {
        name: 'New Cat',
        breed: 'Persian',
        age: 1,
        gender: 'male' as const,
        entryType: 'rescue' as const,
        entryDate: new Date(),
        // isBooked and isAdopted not provided
      };

      const newCat = {
        id: 1,
        ...catData,
        isBooked: false,
        isAdopted: false,
      };

      mockRequest.body = catData;

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newCat]),
        }),
      });

      await createCat(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateCat', () => {
    it('should successfully update a cat', async () => {
      const updatedCat = {
        id: 1,
        ...testCats.available,
        name: 'Updated Name',
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated Name' };
      mockRequest.user = { id: 2, username: 'staff', role: 'clinic_staff' };

      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedCat]),
          }),
        }),
      });

      await updateCat(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedCat,
      });
    });

    it('should return 404 when cat not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Updated Name' };

      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await updateCat(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cat not found',
          statusCode: 404,
        })
      );
    });
  });

  describe('deleteCat', () => {
    it('should successfully delete a cat', async () => {
      const deletedCat = { id: 1, ...testCats.available };

      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 1, username: 'admin', role: 'super_admin' };

      (mockDb.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([deletedCat]),
        }),
      });

      await deleteCat(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: deletedCat,
      });
    });

    it('should return 404 when cat not found', async () => {
      mockRequest.params = { id: '999' };

      (mockDb.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      await deleteCat(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cat not found',
          statusCode: 404,
        })
      );
    });
  });
});

