import { Router } from 'express';
import { getDonations, getDonationById, createDonation, getFundraisingCampaigns } from '../controllers/donationsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/donations:
 *   get:
 *     summary: Get all donations
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Donations retrieved successfully
 *   post:
 *     summary: Create new donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Donation created successfully
 */
router.get('/', authenticate, authorize('clinic_staff', 'super_admin'), getDonations);
router.post('/', authenticate, createDonation);

/**
 * @swagger
 * /api/donations/{id}:
 *   get:
 *     summary: Get donation by ID
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Donation retrieved successfully
 */
router.get('/:id', authenticate, authorize('clinic_staff', 'super_admin'), getDonationById);

/**
 * @swagger
 * /api/donations/campaigns:
 *   get:
 *     summary: Get fundraising campaigns
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fundraising campaigns retrieved successfully
 */
router.get('/campaigns', authenticate, getFundraisingCampaigns);

export { router as donationsRoutes };
