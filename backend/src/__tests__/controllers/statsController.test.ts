import { Request, Response, NextFunction } from 'express';
import { getTotalAdoptions, getCatsStatus, getIncomingCats, getNeuteredCats, getCampaign } from '../../controllers/statsController';
import { db } from '../../db/connection';
import { AuthRequest } from '../../middleware/auth';
import { createMockRequest, createMockResponse, createMockNext, createMockAuthRequest, testUsers } from '../utils/test-helpers';

jest.mock('../../db/connection');

const mockDb = db as jest.Mocked<typeof db>;

describe('Stats Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
    jest.clearAllMocks();
  });

  describe('getTotalAdoptions', () => {
    it('should return total adoptions without date filters', async () => {
      const mockAdoptions = [
        { month: '2024-01', count: 10 },
        { month: '2024-02', count: 15 },
        { month: '2024-03', count: 12 },
      ];

      const mockTotal = { count: 37 };
      const mockMin = { month: '2024-01', count: 10 };
      const mockMax = { month: '2024-02', count: 15 };

      // Mock total count query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockTotal]),
        }),
      });

      // Mock series query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockAdoptions),
            }),
          }),
        }),
      });

      // Mock min query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([mockMin]),
              }),
            }),
          }),
        }),
      });

      // Mock max query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([mockMax]),
              }),
            }),
          }),
        }),
      });

      await getTotalAdoptions(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          total: 37,
          series: expect.any(Array),
          min: expect.objectContaining({ month: '2024-01', count: 10 }),
          max: expect.objectContaining({ month: '2024-02', count: 15 }),
        }),
      });
    });

    it('should filter by start_date and end_date', async () => {
      mockRequest.query = {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      const mockTotal = { count: 10 };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockTotal]),
        }),
      });

      await getTotalAdoptions(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('getCatsStatus', () => {
    it('should return cats status with breakdown', async () => {
      const mockAvailable = { count: 50 };
      const mockBooked = { count: 10 };
      const mockKittens = { count: 15 };
      const mockAdults = { count: 25 };
      const mockSeniors = { count: 10 };

      // Mock available count
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockAvailable]),
        }),
      });

      // Mock booked count
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockBooked]),
        }),
      });

      // Mock kittens
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockKittens]),
        }),
      });

      // Mock adults
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockAdults]),
        }),
      });

      // Mock seniors
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSeniors]),
        }),
      });

      // Mock available series query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      // Mock booked series query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      // Mock min query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{ month: '2024-01', count: 10 }]),
              }),
            }),
          }),
        }),
      });

      // Mock max query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{ month: '2024-03', count: 50 }]),
              }),
            }),
          }),
        }),
      });

      await getCatsStatus(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          available: 50,
          booked: 10,
          available_breakdown: {
            kittens: 15,
            adults: 25,
            seniors: 10,
          },
        }),
      });
    });
  });

  describe('getIncomingCats', () => {
    it('should return 403 for public users', async () => {
      mockRequest.user = undefined;

      await getIncomingCats(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied. Staff or admin role required.',
          statusCode: 403,
        })
      );
    });

    it('should return incoming cats data for staff/admin', async () => {
      mockRequest.user = { id: 2, username: 'staff', role: 'clinic_staff' };

      const mockRescued = { count: 5 };
      const mockSurrendered = { count: 3 };

      // Mock rescued this month query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockRescued]),
        }),
      });

      // Mock surrendered this month query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSurrendered]),
        }),
      });

      // Mock rescue series query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      // Mock surrender series query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      // Mock total incoming series query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      // Mock min incoming query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{ month: '2024-01', count: 5 }]),
              }),
            }),
          }),
        }),
      });

      // Mock max incoming query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{ month: '2024-03', count: 10 }]),
              }),
            }),
          }),
        }),
      });

      await getIncomingCats(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          rescued_this_month: 5,
          surrendered_this_month: 3,
        }),
      });
    });
  });

  describe('getNeuteredCats', () => {
    it('should return 403 for public users', async () => {
      mockRequest.user = undefined;

      await getNeuteredCats(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access denied. Staff or admin role required.',
          statusCode: 403,
        })
      );
    });

    it('should return neutered/spayed data for staff/admin', async () => {
      mockRequest.user = { id: 2, username: 'staff', role: 'clinic_staff' };

      const mockNeutered = { count: 8 };
      const mockSpayed = { count: 12 };

      // Mock neutered this month query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockNeutered]),
        }),
      });

      // Mock spayed this month query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockSpayed]),
        }),
      });

      // Mock neutered series query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      // Mock spayed series query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      // Mock total neutered/spayed series query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      // Mock min neutered/spayed query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{ month: '2024-01', count: 3 }]),
              }),
            }),
          }),
        }),
      });

      // Mock max neutered/spayed query
      (mockDb.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{ month: '2024-03', count: 15 }]),
              }),
            }),
          }),
        }),
      });

      await getNeuteredCats(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          neutered_this_month: 8,
          spayed_this_month: 12,
        }),
      });
    });
  });

  describe('getCampaign', () => {
    it('should return active campaign data', async () => {
      const mockCampaign = {
        id: 1,
        title: 'Test Campaign',
        targetAmount: '50000.00',
        currentAmount: '30000.00',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        currency: 'SEK',
        isActive: true,
      };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockCampaign]),
          }),
        }),
      });

      await getCampaign(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          campaign_goal: 50000,
          current_donated: 30000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        }),
      });
    });
  });
});

