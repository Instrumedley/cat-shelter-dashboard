import { Router } from 'express';
import { getCats, getCatById, createCat, updateCat, deleteCat } from '../controllers/catsController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/cats:
 *   get:
 *     summary: Get all cats
 *     tags: [Cats]
 *     security: []
 *     responses:
 *       200:
 *         description: Cats retrieved successfully
 *   post:
 *     summary: Create new cat
 *     tags: [Cats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - ageGroup
 *               - gender
 *               - entryDate
 *               - entryType
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Fluffy"
 *               age:
 *                 type: integer
 *                 example: 2
 *               ageGroup:
 *                 type: string
 *                 enum: [kitten, adult, senior]
 *                 example: "adult"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: "female"
 *               breed:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Persian"
 *               color:
 *                 type: string
 *                 maxLength: 50
 *                 example: "white"
 *               status:
 *                 type: string
 *                 enum: [available, booked, adopted, deceased]
 *                 default: available
 *                 example: "available"
 *               description:
 *                 type: string
 *                 example: "A friendly and playful cat"
 *               imageUrl:
 *                 type: string
 *                 maxLength: 500
 *                 example: "https://example.com/cat.jpg"
 *               entryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T10:00:00Z"
 *               entryType:
 *                 type: string
 *                 enum: [rescue, surrender, stray]
 *                 example: "rescue"
 *               isNeuteredOrSpayed:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *               isBooked:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               isAdopted:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               medicalNotes:
 *                 type: string
 *                 example: "Requires special diet"
 *     responses:
 *       201:
 *         description: Cat created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.get('/', optionalAuthenticate, getCats);
router.post('/', authenticate, authorize('clinic_staff', 'super_admin'), createCat);

/**
 * @swagger
 * /api/cats/{id}:
 *   get:
 *     summary: Get cat by ID
 *     tags: [Cats]
 *     security: []
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               age:
 *                 type: integer
 *               ageGroup:
 *                 type: string
 *                 enum: [kitten, adult, senior]
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               breed:
 *                 type: string
 *                 maxLength: 100
 *               color:
 *                 type: string
 *                 maxLength: 50
 *               status:
 *                 type: string
 *                 enum: [available, booked, adopted, deceased]
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 maxLength: 500
 *               entryDate:
 *                 type: string
 *                 format: date-time
 *               entryType:
 *                 type: string
 *                 enum: [rescue, surrender, stray]
 *               isNeuteredOrSpayed:
 *                 type: boolean
 *               isBooked:
 *                 type: boolean
 *               isAdopted:
 *                 type: boolean
 *               medicalNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cat updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cat not found
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
router.get('/:id', optionalAuthenticate, getCatById);
router.put('/:id', authenticate, authorize('clinic_staff', 'super_admin'), updateCat);
router.delete('/:id', authenticate, authorize('super_admin'), deleteCat);

export { router as catsRoutes };
