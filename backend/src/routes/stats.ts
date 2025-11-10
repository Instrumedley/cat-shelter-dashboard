import { Router } from 'express';
import { 
  getTotalAdoptions, 
  getCatsStatus, 
  getIncomingCats, 
  getNeuteredCats, 
  getCampaign 
} from '../controllers/statsController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/total_adoptions:
 *   get:
 *     summary: Get total adoptions with optional date filtering
 *     tags: [Stats]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Total adoptions retrieved successfully
 */
router.get('/total_adoptions', optionalAuthenticate, getTotalAdoptions);

/**
 * @swagger
 * /api/cats_status:
 *   get:
 *     summary: Get current cat status counts with monthly breakdown
 *     tags: [Stats]
 *     security: []
 *     responses:
 *       200:
 *         description: Cat status retrieved successfully
 */
router.get('/cats_status', optionalAuthenticate, getCatsStatus);

/**
 * @swagger
 * /api/incoming_cats:
 *   get:
 *     summary: Get incoming cats (rescues and surrenders) this month
 *     tags: [Stats]
 *     security: []
 *     responses:
 *       200:
 *         description: Incoming cats data retrieved successfully
 */
router.get('/incoming_cats', optionalAuthenticate, getIncomingCats);

/**
 * @swagger
 * /api/neutered_cats:
 *   get:
 *     summary: Get neutered and spayed cats this month
 *     tags: [Stats]
 *     security: []
 *     responses:
 *       200:
 *         description: Neutered cats data retrieved successfully
 */
router.get('/neutered_cats', optionalAuthenticate, getNeuteredCats);

/**
 * @swagger
 * /api/campaign:
 *   get:
 *     summary: Get active fundraising campaign information
 *     tags: [Stats]
 *     security: []
 *     responses:
 *       200:
 *         description: Campaign data retrieved successfully
 */
router.get('/campaign', optionalAuthenticate, getCampaign);

export { router as statsRoutes };
