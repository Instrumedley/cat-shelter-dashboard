import { Router } from 'express';
import { getDonations, getDonationById, createDonation, getFundraisingCampaigns } from '../controllers/donationsController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/donations:
 *   get:
 *     summary: Get all donations
 *     tags: [Donations]
 *     security: []
 *     responses:
 *       200:
 *         description: Donations retrieved successfully
 *   post:
 *     summary: Create new donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               donorName:
 *                 type: string
 *                 maxLength: 100
 *                 example: "John Doe"
 *               donorEmail:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *                 example: "john.doe@example.com"
 *               amount:
 *                 type: string
 *                 pattern: '^\d+(\.\d{1,2})?$'
 *                 example: "500.00"
 *                 description: "Amount as decimal string (e.g., '500.00')"
 *               currency:
 *                 type: string
 *                 maxLength: 3
 *                 default: "SEK"
 *                 example: "SEK"
 *               isAnonymous:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               notes:
 *                 type: string
 *                 example: "Thank you for your support!"
 *     responses:
 *       201:
 *         description: Donation created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.get('/', optionalAuthenticate, getDonations);
router.post('/', authenticate, createDonation);

/**
 * @swagger
 * /api/donations/campaigns:
 *   get:
 *     summary: Get fundraising campaigns
 *     tags: [Donations]
 *     security: []
 *     responses:
 *       200:
 *         description: Fundraising campaigns retrieved successfully
 */
router.get('/campaigns', optionalAuthenticate, getFundraisingCampaigns);

/**
 * @swagger
 * /api/donations/{id}:
 *   get:
 *     summary: Get donation by ID
 *     tags: [Donations]
 *     security: []
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
router.get('/:id', optionalAuthenticate, getDonationById);

export { router as donationsRoutes };
