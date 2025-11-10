import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(createError('Access denied. No token provided.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    req.user = decoded;
    next();
  } catch (error) {
    next(createError('Invalid token.', 401));
  }
};

/**
 * Optional authentication - sets user if token is provided, but doesn't fail if not
 */
export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    // No token provided - allow public access
    req.user = undefined;
    return next();
  }
  
  // Token provided - try to verify it
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    req.user = decoded;
  } catch (error) {
    // Invalid or expired token - allow public access without user
    req.user = undefined;
  }
  
  // Always continue - never block the request
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Access denied. User not authenticated.', 401));
    }

    const userRole = req.user.role;
    
    // Check if user has required role or higher
    const roleHierarchy = {
      'public': 0,
      'clinic_staff': 1,
      'super_admin': 2
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = Math.max(...roles.map(role => roleHierarchy[role as keyof typeof roleHierarchy] || 0));

    if (userLevel < requiredLevel) {
      return next(createError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};
