import { Router } from 'express';
import { getAdoptions, getAdoptionById, createAdoption, updateAdoption, deleteAdoption } from '../controllers/adoptionsController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/adoptions:
 *   get:
 *     summary: Get all adoptions
 *     tags: [Adoptions]
 *     security: []
 *     responses:
 *       200:
 *         description: Adoptions retrieved successfully
 *   post:
 *     summary: Create new adoption
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - catId
 *               - userId
 *             properties:
 *               catId:
 *                 type: integer
 *                 example: 1
 *                 description: "ID of the cat being adopted"
 *               userId:
 *                 type: integer
 *                 example: 5
 *                 description: "ID of the user adopting the cat"
 *               adoptedWith:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *                 description: "ID of another cat adopted together (optional)"
 *               status:
 *                 type: string
 *                 enum: [pending, approved, completed, cancelled]
 *                 default: pending
 *                 example: "pending"
 *               adoptionDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2024-01-15T10:00:00Z"
 *               notes:
 *                 type: string
 *                 example: "Adoption notes"
 *     responses:
 *       201:
 *         description: Adoption created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.get('/', optionalAuthenticate, getAdoptions);
router.post('/', authenticate, createAdoption);

/**
 * @swagger
 * /api/adoptions/{id}:
 *   get:
 *     summary: Get adoption by ID
 *     tags: [Adoptions]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Adoption retrieved successfully
 *   put:
 *     summary: Update adoption
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               catId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               adoptedWith:
 *                 type: integer
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [pending, approved, completed, cancelled]
 *               adoptionDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Adoption updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Adoption not found
 *   delete:
 *     summary: Delete adoption
 *     tags: [Adoptions]
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
 *         description: Adoption deleted successfully
 */
router.get('/:id', optionalAuthenticate, getAdoptionById);
router.put('/:id', authenticate, authorize('clinic_staff', 'super_admin'), updateAdoption);
router.delete('/:id', authenticate, authorize('super_admin'), deleteAdoption);

export { router as adoptionsRoutes };
