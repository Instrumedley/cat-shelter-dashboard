import { Request, Response, NextFunction } from 'express';
import { db } from '../db/connection';
import { cats, adoptions, medicalProcedures, fundraisingCampaigns } from '../db/schema';
import { eq, and, gte, lte, sql, desc, asc, or } from 'drizzle-orm';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/total_adoptions
 * Returns total adoptions with optional date filtering
 */
export const getTotalAdoptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date } = req.query;
    
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    if (start_date) {
      startDate = new Date(start_date as string);
      if (isNaN(startDate.getTime())) {
        return next(createError('Invalid start_date format. Use YYYY-MM-DD', 400));
      }
    }
    
    if (end_date) {
      endDate = new Date(end_date as string);
      if (isNaN(endDate.getTime())) {
        return next(createError('Invalid end_date format. Use YYYY-MM-DD', 400));
      }
      // Set to end of day
      endDate.setHours(23, 59, 59, 999);
    }

    // Build where conditions
    const conditions = [eq(adoptions.status, 'completed')];
    if (startDate) {
      conditions.push(gte(adoptions.adoptionDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(adoptions.adoptionDate, endDate));
    }

    // Get total accumulated adoptions in the range
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(adoptions)
      .where(and(...conditions));

    // Get monthly breakdown (NEW adoptions per month, not accumulated)
    const seriesQuery = db
      .select({
        month: sql<string>`to_char(adoption_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(adoptions)
      .where(and(...conditions))
      .groupBy(sql`to_char(adoption_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(adoption_date, 'YYYY-MM')`);

    const series = await seriesQuery;

    // Get min and max
    const [minResult] = await db
      .select({
        month: sql<string>`to_char(adoption_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(adoptions)
      .where(and(...conditions))
      .groupBy(sql`to_char(adoption_date, 'YYYY-MM')`)
      .orderBy(asc(sql`count(*)`))
      .limit(1);

    const [maxResult] = await db
      .select({
        month: sql<string>`to_char(adoption_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(adoptions)
      .where(and(...conditions))
      .groupBy(sql`to_char(adoption_date, 'YYYY-MM')`)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    res.json({
      success: true,
      data: {
        total: totalResult?.count || 0,
        series: series.map(item => ({
          month: item.month,
          count: item.count
        })),
        min: minResult ? {
          month: minResult.month,
          count: minResult.count
        } : null,
        max: maxResult ? {
          month: maxResult.month,
          count: maxResult.count
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cats_status
 * Returns current cat status counts with monthly breakdown
 */
export const getCatsStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Current counts
    const [availableCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cats)
      .where(eq(cats.status, 'available'));

    const [bookedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cats)
      .where(eq(cats.status, 'booked'));

    // Age group breakdown for available cats
    const [kittens] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cats)
      .where(
        and(
          eq(cats.status, 'available'),
          eq(cats.ageGroup, 'kitten')
        )
      );

    const [adults] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cats)
      .where(
        and(
          eq(cats.status, 'available'),
          eq(cats.ageGroup, 'adult')
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

    // Monthly series for available cats (based on entry_date)
    const availableSeries = await db
      .select({
        month: sql<string>`to_char(entry_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(cats)
      .where(eq(cats.status, 'available'))
      .groupBy(sql`to_char(entry_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(entry_date, 'YYYY-MM')`);

    // Monthly series for booked cats
    const bookedSeries = await db
      .select({
        month: sql<string>`to_char(entry_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(cats)
      .where(eq(cats.status, 'booked'))
      .groupBy(sql`to_char(entry_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(entry_date, 'YYYY-MM')`);

    // Min and max for available cats
    const [minAvailable] = await db
      .select({
        month: sql<string>`to_char(entry_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(cats)
      .where(eq(cats.status, 'available'))
      .groupBy(sql`to_char(entry_date, 'YYYY-MM')`)
      .orderBy(asc(sql`count(*)`))
      .limit(1);

    const [maxAvailable] = await db
      .select({
        month: sql<string>`to_char(entry_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(cats)
      .where(eq(cats.status, 'available'))
      .groupBy(sql`to_char(entry_date, 'YYYY-MM')`)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    res.json({
      success: true,
      data: {
        available: availableCount?.count || 0,
        booked: bookedCount?.count || 0,
        available_breakdown: {
          kittens: kittens?.count || 0,
          adults: adults?.count || 0,
          seniors: seniors?.count || 0
        },
        series: {
          available: availableSeries.map(item => ({
            month: item.month,
            count: item.count
          })),
          booked: bookedSeries.map(item => ({
            month: item.month,
            count: item.count
          }))
        },
        min: minAvailable ? {
          month: minAvailable.month,
          count: minAvailable.count
        } : null,
        max: maxAvailable ? {
          month: maxAvailable.month,
          count: maxAvailable.count
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/incoming_cats
 * Returns incoming cats (rescues and surrenders) this month with series data
 * Requires clinic_staff or super_admin role
 */
export const getIncomingCats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated and has required role
    if (!req.user || (req.user.role !== 'clinic_staff' && req.user.role !== 'super_admin')) {
      return next(createError('Access denied. Staff or admin role required.', 403));
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // This month counts
    const [rescuedThisMonth] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cats)
      .where(
        and(
          eq(cats.entryType, 'rescue'),
          gte(cats.entryDate, startOfMonth),
          lte(cats.entryDate, endOfMonth)
        )
      );

    const [surrenderedThisMonth] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cats)
      .where(
        and(
          eq(cats.entryType, 'surrender'),
          gte(cats.entryDate, startOfMonth),
          lte(cats.entryDate, endOfMonth)
        )
      );

    // Monthly series for rescues
    const rescueSeries = await db
      .select({
        month: sql<string>`to_char(entry_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(cats)
      .where(eq(cats.entryType, 'rescue'))
      .groupBy(sql`to_char(entry_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(entry_date, 'YYYY-MM')`);

    // Monthly series for surrenders
    const surrenderSeries = await db
      .select({
        month: sql<string>`to_char(entry_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(cats)
      .where(eq(cats.entryType, 'surrender'))
      .groupBy(sql`to_char(entry_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(entry_date, 'YYYY-MM')`);

    // Combined series (total incoming per month)
    const totalIncomingSeries = await db
      .select({
        month: sql<string>`to_char(entry_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(cats)
      .where(
        or(
          eq(cats.entryType, 'rescue'),
          eq(cats.entryType, 'surrender')
        )
      )
      .groupBy(sql`to_char(entry_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(entry_date, 'YYYY-MM')`);

    // Min and max for total incoming
    const [minIncoming] = await db
      .select({
        month: sql<string>`to_char(entry_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(cats)
      .where(
        or(
          eq(cats.entryType, 'rescue'),
          eq(cats.entryType, 'surrender')
        )
      )
      .groupBy(sql`to_char(entry_date, 'YYYY-MM')`)
      .orderBy(asc(sql`count(*)`))
      .limit(1);

    const [maxIncoming] = await db
      .select({
        month: sql<string>`to_char(entry_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(cats)
      .where(
        or(
          eq(cats.entryType, 'rescue'),
          eq(cats.entryType, 'surrender')
        )
      )
      .groupBy(sql`to_char(entry_date, 'YYYY-MM')`)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    res.json({
      success: true,
      data: {
        rescued_this_month: rescuedThisMonth?.count || 0,
        surrendered_this_month: surrenderedThisMonth?.count || 0,
        series: {
          rescued: rescueSeries.map(item => ({
            month: item.month,
            count: item.count
          })),
          surrendered: surrenderSeries.map(item => ({
            month: item.month,
            count: item.count
          })),
          total: totalIncomingSeries.map(item => ({
            month: item.month,
            count: item.count
          }))
        },
        min: minIncoming ? {
          month: minIncoming.month,
          count: minIncoming.count
        } : null,
        max: maxIncoming ? {
          month: maxIncoming.month,
          count: maxIncoming.count
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/neutered_cats
 * Returns neutered and spayed cats this month with series data
 * Requires clinic_staff or super_admin role
 */
export const getNeuteredCats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated and has required role
    if (!req.user || (req.user.role !== 'clinic_staff' && req.user.role !== 'super_admin')) {
      return next(createError('Access denied. Staff or admin role required.', 403));
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // This month counts
    const [neuteredThisMonth] = await db
      .select({ count: sql<number>`count(*)` })
      .from(medicalProcedures)
      .where(
        and(
          eq(medicalProcedures.procedureType, 'neutered'),
          gte(medicalProcedures.procedureDate, startOfMonth),
          lte(medicalProcedures.procedureDate, endOfMonth)
        )
      );

    const [spayedThisMonth] = await db
      .select({ count: sql<number>`count(*)` })
      .from(medicalProcedures)
      .where(
        and(
          eq(medicalProcedures.procedureType, 'spayed'),
          gte(medicalProcedures.procedureDate, startOfMonth),
          lte(medicalProcedures.procedureDate, endOfMonth)
        )
      );

    // Monthly series for neutered
    const neuteredSeries = await db
      .select({
        month: sql<string>`to_char(procedure_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(medicalProcedures)
      .where(eq(medicalProcedures.procedureType, 'neutered'))
      .groupBy(sql`to_char(procedure_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(procedure_date, 'YYYY-MM')`);

    // Monthly series for spayed
    const spayedSeries = await db
      .select({
        month: sql<string>`to_char(procedure_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(medicalProcedures)
      .where(eq(medicalProcedures.procedureType, 'spayed'))
      .groupBy(sql`to_char(procedure_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(procedure_date, 'YYYY-MM')`);

    // Combined series (total procedures per month)
    const totalProceduresSeries = await db
      .select({
        month: sql<string>`to_char(procedure_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(medicalProcedures)
      .where(
        or(
          eq(medicalProcedures.procedureType, 'neutered'),
          eq(medicalProcedures.procedureType, 'spayed')
        )
      )
      .groupBy(sql`to_char(procedure_date, 'YYYY-MM')`)
      .orderBy(sql`to_char(procedure_date, 'YYYY-MM')`);

    // Min and max for total procedures
    const [minProcedures] = await db
      .select({
        month: sql<string>`to_char(procedure_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(medicalProcedures)
      .where(
        or(
          eq(medicalProcedures.procedureType, 'neutered'),
          eq(medicalProcedures.procedureType, 'spayed')
        )
      )
      .groupBy(sql`to_char(procedure_date, 'YYYY-MM')`)
      .orderBy(asc(sql`count(*)`))
      .limit(1);

    const [maxProcedures] = await db
      .select({
        month: sql<string>`to_char(procedure_date, 'YYYY-MM')`,
        count: sql<number>`count(*)`
      })
      .from(medicalProcedures)
      .where(
        or(
          eq(medicalProcedures.procedureType, 'neutered'),
          eq(medicalProcedures.procedureType, 'spayed')
        )
      )
      .groupBy(sql`to_char(procedure_date, 'YYYY-MM')`)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    res.json({
      success: true,
      data: {
        neutered_this_month: neuteredThisMonth?.count || 0,
        spayed_this_month: spayedThisMonth?.count || 0,
        series: {
          neutered: neuteredSeries.map(item => ({
            month: item.month,
            count: item.count
          })),
          spayed: spayedSeries.map(item => ({
            month: item.month,
            count: item.count
          })),
          total: totalProceduresSeries.map(item => ({
            month: item.month,
            count: item.count
          }))
        },
        min: minProcedures ? {
          month: minProcedures.month,
          count: minProcedures.count
        } : null,
        max: maxProcedures ? {
          month: maxProcedures.month,
          count: maxProcedures.count
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/campaign
 * Returns active fundraising campaign information
 */
export const getCampaign = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [activeCampaign] = await db
      .select()
      .from(fundraisingCampaigns)
      .where(eq(fundraisingCampaigns.isActive, true))
      .limit(1);

    if (!activeCampaign) {
      return res.json({
        success: true,
        data: null
      });
    }

    return res.json({
      success: true,
      data: {
        campaign_goal: parseFloat(activeCampaign.targetAmount),
        current_donated: parseFloat(activeCampaign.currentAmount),
        start_date: activeCampaign.startDate.toISOString().split('T')[0],
        end_date: activeCampaign.endDate ? activeCampaign.endDate.toISOString().split('T')[0] : null
      }
    });
  } catch (error) {
    return next(error);
  }
};
