import { Router } from 'express';
import { getDashboardMetrics, getAdoptionHistory } from '../controllers/metricsController';
import { optionalAuthenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/metrics/dashboard:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Metrics]
 *     security: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 */
router.get('/dashboard', optionalAuthenticate, getDashboardMetrics);

/**
 * @swagger
 * /api/metrics/adoption-history:
 *   get:
 *     summary: Get adoption history for charts
 *     tags: [Metrics]
 *     security: []
 *     responses:
 *       200:
 *         description: Adoption history retrieved successfully
 */
router.get('/adoption-history', optionalAuthenticate, getAdoptionHistory);

export { router as metricsRoutes };
