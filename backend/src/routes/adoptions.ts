import { Router } from 'express';
import { getAdoptions, getAdoptionById, createAdoption, updateAdoption, deleteAdoption } from '../controllers/adoptionsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/adoptions:
 *   get:
 *     summary: Get all adoptions
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Adoptions retrieved successfully
 *   post:
 *     summary: Create new adoption
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Adoption created successfully
 */
router.get('/', authenticate, getAdoptions);
router.post('/', authenticate, createAdoption);

/**
 * @swagger
 * /api/adoptions/{id}:
 *   get:
 *     summary: Get adoption by ID
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
 *     responses:
 *       200:
 *         description: Adoption updated successfully
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
router.get('/:id', authenticate, getAdoptionById);
router.put('/:id', authenticate, authorize('clinic_staff', 'super_admin'), updateAdoption);
router.delete('/:id', authenticate, authorize('super_admin'), deleteAdoption);

export { router as adoptionsRoutes };
