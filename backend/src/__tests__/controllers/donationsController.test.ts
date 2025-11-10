import { Request, Response, NextFunction } from 'express';
import { createDonation, getDonations, getDonationById, getFundraisingCampaigns } from '../../controllers/donationsController';
import { db } from '../../db/connection';
import { createMockRequest, createMockResponse, createMockNext, createAuthenticatedRequest, testUsers, testDonations, testCampaigns } from '../utils/test-helpers';

jest.mock('../../db/connection');

const mockDb = db as jest.Mocked<typeof db>;

// Mock Socket.IO
const mockIo = {
  emit: jest.fn(),
};

(global as any).io = mockIo;

describe('Donations Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
    jest.clearAllMocks();
  });

  describe('createDonation', () => {
    it('should successfully create a donation', async () => {
      const donationData = {
        id: 1,
        ...testDonations.standard,
        createdAt: new Date(),
      };

      mockRequest.body = testDonations.standard;

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([donationData]),
        }),
      });

      // Mock campaign query (no active campaign)
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await createDonation(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: donationData,
      });
    });

    it('should update active campaign and emit Socket.IO event', async () => {
      const donationData = {
        id: 1,
        amount: '5000.00',
        currency: 'SEK',
        donorName: 'Test Donor',
        donorEmail: 'donor@test.com',
        createdAt: new Date(),
      };

      const activeCampaign = {
        id: 1,
        ...testCampaigns.active,
        currentAmount: '30000.00',
      };

      mockRequest.body = {
        amount: '5000.00',
        currency: 'SEK',
      };

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([donationData]),
        }),
      });

      // Mock finding active campaign
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([activeCampaign]),
          }),
        }),
      });

      // Mock campaign update
      (mockDb.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await createDonation(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockIo.emit).toHaveBeenCalledWith('campaign:updated', {
        campaignId: 1,
        currentAmount: 35000,
        targetAmount: 50000,
        currency: 'SEK',
      });
    });

    it('should not update campaign if currency does not match', async () => {
      const donationData = {
        id: 1,
        amount: '1000.00',
        currency: 'USD',
        createdAt: new Date(),
      };

      const activeCampaign = {
        id: 1,
        ...testCampaigns.active,
        currency: 'SEK',
      };

      mockRequest.body = {
        amount: '1000.00',
        currency: 'USD',
      };

      (mockDb.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([donationData]),
        }),
      });

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]), // No matching currency campaign
          }),
        }),
      });

      await createDonation(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockIo.emit).not.toHaveBeenCalled();
    });
  });

  describe('getDonations', () => {
    it('should return all donations', async () => {
      const mockDonations = [
        { id: 1, amount: '1000.00', currency: 'SEK' },
        { id: 2, amount: '500.00', currency: 'SEK' },
      ];

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValue(mockDonations),
      });

      await getDonations(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockDonations,
      });
    });

    it('should return empty array when no donations exist', async () => {
      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
      });

      await getDonations(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });
  });

  describe('getDonationById', () => {
    it('should return donation with valid ID', async () => {
      const mockDonation = { id: 1, amount: '1000.00', currency: 'SEK' };

      mockRequest.params = { id: '1' };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockDonation]),
          }),
        }),
      });

      await getDonationById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockDonation,
      });
    });

    it('should return 400 with non-numeric ID', async () => {
      mockRequest.params = { id: 'invalid' };

      await getDonationById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid donation ID',
          statusCode: 400,
        })
      );
    });

    it('should return 404 when donation not found', async () => {
      mockRequest.params = { id: '999' };

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await getDonationById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Donation not found',
          statusCode: 404,
        })
      );
    });
  });

  describe('getFundraisingCampaigns', () => {
    it('should return all campaigns', async () => {
      const mockCampaigns = [
        { id: 1, title: 'Campaign 1', isActive: true },
        { id: 2, title: 'Campaign 2', isActive: false },
      ];

      (mockDb.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValue(mockCampaigns),
      });

      await getFundraisingCampaigns(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCampaigns,
      });
    });
  });
});

