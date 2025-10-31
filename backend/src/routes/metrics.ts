import { Router } from 'express';
import { getDashboardMetrics, getAdoptionHistory } from '../controllers/metricsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/metrics/dashboard:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 */
router.get('/dashboard', authenticate, getDashboardMetrics);

/**
 * @swagger
 * /api/metrics/adoption-history:
 *   get:
 *     summary: Get adoption history for charts
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Adoption history retrieved successfully
 */
router.get('/adoption-history', authenticate, getAdoptionHistory);

export { router as metricsRoutes };
