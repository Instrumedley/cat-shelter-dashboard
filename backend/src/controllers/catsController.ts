import { Request, Response, NextFunction } from 'express';
import { db } from '../db/connection';
import { cats } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';

export const getCats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allCats = await db.select().from(cats);
    
    res.json({
      success: true,
      data: allCats
    });
  } catch (error) {
    next(error);
  }
};

export const getCatById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cat = await db.select().from(cats).where(eq(cats.id, parseInt(id))).limit(1);
    
    if (cat.length === 0) {
      return next(createError('Cat not found', 404));
    }

    res.json({
      success: true,
      data: cat[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createCat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newCat = await db.insert(cats).values(req.body).returning();
    
    res.status(201).json({
      success: true,
      data: newCat[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateCat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedCat = await db
      .update(cats)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(cats.id, parseInt(id)))
      .returning();
    
    if (updatedCat.length === 0) {
      return next(createError('Cat not found', 404));
    }

    res.json({
      success: true,
      data: updatedCat[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedCat = await db
      .delete(cats)
      .where(eq(cats.id, parseInt(id)))
      .returning();
    
    if (deletedCat.length === 0) {
      return next(createError('Cat not found', 404));
    }

    res.json({
      success: true,
      data: deletedCat[0]
    });
  } catch (error) {
    next(error);
  }
};
