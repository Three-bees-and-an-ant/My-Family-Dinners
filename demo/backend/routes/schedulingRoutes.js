import express from 'express';
import * as schedulingController from '../controllers/schedulingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/hours', schedulingController.getRestaurantHours);
router.get('/time-slots', authenticate, schedulingController.getAvailableTimeSlots);
router.post('/validate', authenticate, schedulingController.validateScheduledDate);

export default router;

