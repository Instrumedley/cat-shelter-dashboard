import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(createError('Username and password are required', 400));
    }

    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
    
    if (user.length === 0) {
      return next(createError('Invalid credentials', 401));
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    
    if (!isValidPassword) {
      return next(createError('Invalid credentials', 401));
    }

    const token = jwt.sign(
      { 
        id: user[0].id, 
        username: user[0].username, 
        role: user[0].role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user[0].id,
          username: user[0].username,
          role: user[0].role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, username, password, email, phone, role = 'public' } = req.body;

    if (!name || !username || !password || !email || !phone) {
      return next(createError('Name, username, password, email, and phone are required', 400));
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
    
    if (existingUser.length > 0) {
      return next(createError('Username already exists', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db.insert(users).values({
      name,
      username,
      password: hashedPassword,
      email,
      phone,
      role: role as 'super_admin' | 'clinic_staff' | 'public'
    }).returning();

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser[0].id,
          name: newUser[0].name,
          username: newUser[0].username,
          email: newUser[0].email,
          phone: newUser[0].phone,
          role: newUser[0].role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
