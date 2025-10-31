import { Router } from 'express';
import { getCats, getCatById, createCat, updateCat, deleteCat } from '../controllers/catsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/cats:
 *   get:
 *     summary: Get all cats
 *     tags: [Cats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cats retrieved successfully
 *   post:
 *     summary: Create new cat
 *     tags: [Cats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Cat created successfully
 */
router.get('/', authenticate, getCats);
router.post('/', authenticate, authorize('clinic_staff', 'super_admin'), createCat);

/**
 * @swagger
 * /api/cats/{id}:
 *   get:
 *     summary: Get cat by ID
 *     tags: [Cats]
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
 *         description: Cat retrieved successfully
 *   put:
 *     summary: Update cat
 *     tags: [Cats]
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
 *         description: Cat updated successfully
 *   delete:
 *     summary: Delete cat
 *     tags: [Cats]
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
 *         description: Cat deleted successfully
 */
router.get('/:id', authenticate, getCatById);
router.put('/:id', authenticate, authorize('clinic_staff', 'super_admin'), updateCat);
router.delete('/:id', authenticate, authorize('super_admin'), deleteCat);

export { router as catsRoutes };
