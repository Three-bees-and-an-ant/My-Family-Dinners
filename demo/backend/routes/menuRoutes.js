import express from 'express';
import * as menuController from '../controllers/menuController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateMenuItem, validateId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.get('/', asyncHandler(menuController.getAllMenuItems));
router.get('/:id', validateId, asyncHandler(menuController.getMenuItem));

// Protected routes (staff/admin only)
router.post('/', authenticate, authorize('staff', 'admin'), validateMenuItem, asyncHandler(menuController.createMenuItem));
router.put('/:id', authenticate, authorize('staff', 'admin'), validateId, validateMenuItem, asyncHandler(menuController.updateMenuItem));
router.delete('/:id', authenticate, authorize('staff', 'admin'), validateId, asyncHandler(menuController.deleteMenuItem));

export default router;

