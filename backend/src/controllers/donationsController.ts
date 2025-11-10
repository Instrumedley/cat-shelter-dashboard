import { Request, Response, NextFunction } from 'express';
import { db } from '../db/connection';
import { donations, fundraisingCampaigns } from '../db/schema';
import { eq, and } from 'drizzle-orm';
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
    const donationId = parseInt(id);
    
    if (isNaN(donationId)) {
      return next(createError('Invalid donation ID', 400));
    }
    
    const donation = await db.select().from(donations).where(eq(donations.id, donationId)).limit(1);
    
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
    
    // Update active campaign if donation amount is provided
    if (newDonation[0] && newDonation[0].amount) {
      const donationAmount = parseFloat(newDonation[0].amount);
      const donationCurrency = newDonation[0].currency || 'SEK';
      
      // Find active campaign with matching currency
      const activeCampaigns = await db
        .select()
        .from(fundraisingCampaigns)
        .where(
          and(
            eq(fundraisingCampaigns.isActive, true),
            eq(fundraisingCampaigns.currency, donationCurrency)
          )
        )
        .limit(1);
      
      if (activeCampaigns.length > 0) {
        const campaign = activeCampaigns[0];
        const newCurrentAmount = parseFloat(campaign.currentAmount) + donationAmount;
        
        // Update campaign current amount
        await db
          .update(fundraisingCampaigns)
          .set({ 
            currentAmount: newCurrentAmount.toString(),
            updatedAt: new Date()
          })
          .where(eq(fundraisingCampaigns.id, campaign.id));
        
        // Emit Socket.IO event to notify all clients
        const io = (global as any).io;
        if (io) {
          io.emit('campaign:updated', {
            campaignId: campaign.id,
            currentAmount: newCurrentAmount,
            targetAmount: parseFloat(campaign.targetAmount),
            currency: campaign.currency
          });
        }
      }
    }
    
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
