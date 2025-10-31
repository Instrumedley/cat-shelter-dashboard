import { Request, Response, NextFunction } from 'express';
import { db } from '../db/connection';
import { cats, adoptions, medicalProcedures, donations, fundraisingCampaigns } from '../db/schema';
import { eq, and, gte, lte, sql, desc, asc } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getDashboardMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get user role for permission-based data
    const userRole = req.user?.role || 'public';

    // 1. Total adoptions (this month/this year)
    const [adoptionsThisMonth] = await db
      .select({ count: sql<number>`count(*)` })
      .from(adoptions)
      .where(
        and(
          eq(adoptions.status, 'completed'),
          gte(adoptions.adoptionDate, startOfMonth)
        )
      );

    const [adoptionsThisYear] = await db
      .select({ count: sql<number>`count(*)` })
      .from(adoptions)
      .where(
        and(
          eq(adoptions.status, 'completed'),
          gte(adoptions.adoptionDate, startOfYear)
        )
      );

    // Min/Max adoptions
    const [minAdoptions] = await db
      .select({ 
        count: sql<number>`count(*)`,
        month: sql<string>`to_char(adoption_date, 'YYYY-MM')`
      })
      .from(adoptions)
      .where(eq(adoptions.status, 'completed'))
      .groupBy(sql`to_char(adoption_date, 'YYYY-MM')`)
      .orderBy(asc(sql`count(*)`))
      .limit(1);

    const [maxAdoptions] = await db
      .select({ 
        count: sql<number>`count(*)`,
        month: sql<string>`to_char(adoption_date, 'YYYY-MM')`
      })
      .from(adoptions)
      .where(eq(adoptions.status, 'completed'))
      .groupBy(sql`to_char(adoption_date, 'YYYY-MM')`)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    // 2. Adoptable cats overview
    const [totalAvailable] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cats)
      .where(eq(cats.status, 'available'));

    const [totalBooked] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cats)
      .where(eq(cats.status, 'booked'));

    const [kittens] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cats)
      .where(
        and(
          eq(cats.status, 'available'),
          eq(cats.ageGroup, 'kitten')
        )
      );

    const [seniors] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cats)
      .where(
        and(
          eq(cats.status, 'available'),
          eq(cats.ageGroup, 'senior')
        )
      );

    // 3. Incoming cats this month (only for clinic staff and super admin)
    let incomingCatsThisMonth = null;
    if (userRole === 'clinic_staff' || userRole === 'super_admin') {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(cats)
        .where(gte(cats.entryDate, startOfMonth));
      incomingCatsThisMonth = result;
    }

    // 4. Medical procedures this month (only for clinic staff and super admin)
    let neuteredThisMonth = null;
    let spayedThisMonth = null;
    if (userRole === 'clinic_staff' || userRole === 'super_admin') {
      const [neutered] = await db
        .select({ count: sql<number>`count(*)` })
        .from(medicalProcedures)
        .where(
          and(
            eq(medicalProcedures.procedureType, 'neutered'),
            gte(medicalProcedures.procedureDate, startOfMonth)
          )
        );

      const [spayed] = await db
        .select({ count: sql<number>`count(*)` })
        .from(medicalProcedures)
        .where(
          and(
            eq(medicalProcedures.procedureType, 'spayed'),
            gte(medicalProcedures.procedureDate, startOfMonth)
          )
        );

      neuteredThisMonth = neutered;
      spayedThisMonth = spayed;
    }

    // 5. Fundraising progress
    const [activeCampaign] = await db
      .select()
      .from(fundraisingCampaigns)
      .where(eq(fundraisingCampaigns.isActive, true))
      .limit(1);

    res.json({
      success: true,
      data: {
        adoptions: {
          thisMonth: adoptionsThisMonth?.count || 0,
          thisYear: adoptionsThisYear?.count || 0,
          min: minAdoptions,
          max: maxAdoptions
        },
        cats: {
          totalAvailable: totalAvailable?.count || 0,
          totalBooked: totalBooked?.count || 0,
          kittens: kittens?.count || 0,
          seniors: seniors?.count || 0
        },
        incomingCats: incomingCatsThisMonth ? {
          thisMonth: incomingCatsThisMonth.count,
          min: null, // Would need additional queries
          max: null  // Would need additional queries
        } : null,
        medicalProcedures: (userRole === 'clinic_staff' || userRole === 'super_admin') ? {
          neuteredThisMonth: neuteredThisMonth?.count || 0,
          spayedThisMonth: spayedThisMonth?.count || 0,
          min: null, // Would need additional queries
          max: null  // Would need additional queries
        } : null,
        fundraising: activeCampaign ? {
          title: activeCampaign.title,
          currentAmount: parseFloat(activeCampaign.currentAmount),
          targetAmount: parseFloat(activeCampaign.targetAmount),
          currency: activeCampaign.currency,
          progress: (parseFloat(activeCampaign.currentAmount) / parseFloat(activeCampaign.targetAmount)) * 100
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAdoptionHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get last 12 months of adoption data
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const adoptionHistory = await db
      .select({
        month: sql<string>`to_char(adoption_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(adoptions)
      .where(
        and(
          eq(adoptions.status, 'completed'),
          gte(adoptions.adoptionDate, twelveMonthsAgo)
        )
      )
      .groupBy(sql`to_char(adoption_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(adoption_date, 'YYYY-MM')`);

    res.json({
      success: true,
      data: adoptionHistory
    });
  } catch (error) {
    next(error);
  }
};
