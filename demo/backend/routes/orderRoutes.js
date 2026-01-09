import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateOrder, validateId } from '../middleware/validation.js';
import { orderRateLimit } from '../middleware/security.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// User routes
router.post('/', authenticate, orderRateLimit, validateOrder, asyncHandler(orderController.createOrder));
router.get('/my-orders', authenticate, asyncHandler(orderController.getUserOrders));
router.get('/:id', authenticate, validateId, asyncHandler(orderController.getOrder));
router.put('/:id/cancel', authenticate, validateId, asyncHandler(orderController.cancelOrder));

// Staff routes
router.get('/pending/all', authenticate, authorize('staff', 'admin'), asyncHandler(orderController.getPendingOrders));
router.put('/:id/confirm', authenticate, authorize('staff', 'admin'), validateId, asyncHandler(orderController.confirmOrder));
router.put('/:id/reject', authenticate, authorize('staff', 'admin'), validateId, asyncHandler(orderController.rejectOrder));

export default router;

