import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, notificationController.getUserNotifications);
router.put('/:id/read', authenticate, notificationController.markNotificationAsRead);
router.put('/read-all', authenticate, notificationController.markAllNotificationsAsRead);

export default router;

