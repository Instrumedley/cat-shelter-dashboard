import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import jwt from 'jsonwebtoken';

/**
 * Create a mock Express request object
 */
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  const headers: any = overrides.headers || {};
  const headerFn = jest.fn((name: string) => {
    const key = name.toLowerCase();
    if (key === 'authorization') {
      return headers.authorization || headers.Authorization || null;
    }
    return headers[key] || headers[name] || null;
  });
  
  const getFn = jest.fn((name: string) => {
    const key = name.toLowerCase();
    if (key === 'authorization') {
      return headers.authorization || headers.Authorization || null;
    }
    return headers[key] || headers[name] || null;
  });
  
  return {
    body: {},
    params: {},
    query: {},
    headers,
    header: headerFn,
    get: getFn,
    ...overrides,
  } as Partial<Request>;
};

/**
 * Create a mock Express response object
 */
export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Create a mock Express next function
 */
export const createMockNext = (): NextFunction => {
  return jest.fn();
};

/**
 * Create a mock AuthRequest with user
 */
export const createMockAuthRequest = (
  user: { id: number; username: string; role: string },
  overrides: Partial<AuthRequest> = {}
): Partial<AuthRequest> => {
  return {
    ...createMockRequest(overrides),
    user,
  } as Partial<AuthRequest>;
};

/**
 * Generate a test JWT token
 */
export const generateTestToken = (user: { id: number; username: string; role: string }): string => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '24h' }
  );
};

/**
 * Create request with authorization header
 */
export const createAuthenticatedRequest = (
  user: { id: number; username: string; role: string },
  overrides: Partial<Request> = {}
): Partial<AuthRequest> => {
  const token = generateTestToken(user);
  return {
    ...createMockRequest(overrides),
    headers: {
      authorization: `Bearer ${token}`,
      ...overrides.headers,
    },
    user,
  } as Partial<AuthRequest>;
};

/**
 * Test user fixtures
 */
export const testUsers = {
  superAdmin: {
    id: 1,
    username: 'admin',
    password: 'admin',
    name: 'Super Admin',
    email: 'admin@test.com',
    phone: '1234567890',
    role: 'super_admin' as const,
  },
  clinicStaff: {
    id: 2,
    username: 'staff',
    password: 'staff',
    name: 'Clinic Staff',
    email: 'staff@test.com',
    phone: '1234567891',
    role: 'clinic_staff' as const,
  },
  publicUser: {
    id: 3,
    username: 'public',
    password: 'public',
    name: 'Public User',
    email: 'public@test.com',
    phone: '1234567892',
    role: 'public' as const,
  },
};

/**
 * Test cat fixtures
 */
export const testCats = {
  available: {
    name: 'Fluffy',
    breed: 'Persian',
    age: 2,
    gender: 'female' as const,
    entryType: 'rescue' as const,
    entryDate: new Date('2024-01-15'),
    isNeuteredOrSpayed: true,
    isBooked: false,
    isAdopted: false,
  },
  booked: {
    name: 'Whiskers',
    breed: 'Siamese',
    age: 1,
    gender: 'male' as const,
    entryType: 'surrender' as const,
    entryDate: new Date('2024-02-10'),
    isNeuteredOrSpayed: false,
    isBooked: true,
    isAdopted: false,
  },
  adopted: {
    name: 'Mittens',
    breed: 'Maine Coon',
    age: 3,
    gender: 'female' as const,
    entryType: 'rescue' as const,
    entryDate: new Date('2023-12-01'),
    isNeuteredOrSpayed: true,
    isBooked: false,
    isAdopted: true,
  },
};

/**
 * Test adoption fixtures
 */
export const testAdoptions = {
  completed: {
    catId: 1,
    userId: 3,
    adoptionDate: new Date('2024-03-15'),
    status: 'completed' as const,
    notes: 'Test adoption',
  },
  pending: {
    catId: 2,
    userId: 3,
    adoptionDate: new Date('2024-03-20'),
    status: 'pending' as const,
    notes: 'Pending adoption',
  },
};

/**
 * Test donation fixtures
 */
export const testDonations = {
  standard: {
    amount: '1000.00',
    currency: 'SEK',
    donorName: 'Test Donor',
    donorEmail: 'donor@test.com',
    isAnonymous: false,
    notes: 'Test donation',
  },
  anonymous: {
    amount: '500.00',
    currency: 'SEK',
    isAnonymous: true,
  },
};

/**
 * Test campaign fixtures
 */
export const testCampaigns = {
  active: {
    title: 'Test Campaign',
    description: 'Test campaign description',
    targetAmount: '50000.00',
    currentAmount: '30000.00',
    currency: 'SEK',
    isActive: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
  },
  inactive: {
    title: 'Old Campaign',
    description: 'Old campaign',
    targetAmount: '10000.00',
    currentAmount: '10000.00',
    currency: 'SEK',
    isActive: false,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
  },
};

