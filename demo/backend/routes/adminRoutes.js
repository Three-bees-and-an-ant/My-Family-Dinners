import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/logs', adminController.getSystemLogs);
router.get('/users', adminController.getAllUsers);
router.get('/orders', adminController.getAllOrders);
router.get('/stats', adminController.getSystemStats);
router.get('/restaurant-status', adminController.getRestaurantStatus);
router.put('/restaurant-status', adminController.setRestaurantStatus);

export default router;

