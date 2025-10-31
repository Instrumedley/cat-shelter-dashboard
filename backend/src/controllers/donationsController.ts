import { Request, Response, NextFunction } from 'express';
import { db } from '../db/connection';
import { donations, fundraisingCampaigns } from '../db/schema';
import { eq } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';

export const getDonations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allDonations = await db.select().from(donations);
    
    res.json({
      success: true,
      data: allDonations
    });
  } catch (error) {
    next(error);
  }
};

export const getDonationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const donation = await db.select().from(donations).where(eq(donations.id, parseInt(id))).limit(1);
    
    if (donation.length === 0) {
      return next(createError('Donation not found', 404));
    }

    res.json({
      success: true,
      data: donation[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newDonation = await db.insert(donations).values(req.body).returning();
    
    res.status(201).json({
      success: true,
      data: newDonation[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getFundraisingCampaigns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await db.select().from(fundraisingCampaigns);
    
    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    next(error);
  }
};
