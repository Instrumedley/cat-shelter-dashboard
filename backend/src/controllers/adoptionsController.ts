import { Request, Response, NextFunction } from 'express';
import { db } from '../db/connection';
import { adoptions, cats, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';

export const getAdoptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allAdoptions = await db
      .select({
        adoption: adoptions,
        cat: cats,
        user: users
      })
      .from(adoptions)
      .leftJoin(cats, eq(adoptions.catId, cats.id))
      .leftJoin(users, eq(adoptions.userId, users.id));
    
    res.json({
      success: true,
      data: allAdoptions
    });
  } catch (error) {
    next(error);
  }
};

export const getAdoptionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adoption = await db
      .select({
        adoption: adoptions,
        cat: cats,
        user: users
      })
      .from(adoptions)
      .leftJoin(cats, eq(adoptions.catId, cats.id))
      .leftJoin(users, eq(adoptions.userId, users.id))
      .where(eq(adoptions.id, parseInt(id)))
      .limit(1);
    
    if (adoption.length === 0) {
      return next(createError('Adoption not found', 404));
    }

    res.json({
      success: true,
      data: adoption[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createAdoption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newAdoption = await db.insert(adoptions).values(req.body).returning();
    
    res.status(201).json({
      success: true,
      data: newAdoption[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdoption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedAdoption = await db
      .update(adoptions)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(adoptions.id, parseInt(id)))
      .returning();
    
    if (updatedAdoption.length === 0) {
      return next(createError('Adoption not found', 404));
    }

    res.json({
      success: true,
      data: updatedAdoption[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdoption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedAdoption = await db
      .delete(adoptions)
      .where(eq(adoptions.id, parseInt(id)))
      .returning();
    
    if (deletedAdoption.length === 0) {
      return next(createError('Adoption not found', 404));
    }

    res.json({
      success: true,
      data: deletedAdoption[0]
    });
  } catch (error) {
    next(error);
  }
};
