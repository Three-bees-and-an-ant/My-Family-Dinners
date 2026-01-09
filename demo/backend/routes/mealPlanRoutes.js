import express from 'express';
import * as mealPlanController from '../controllers/mealPlanController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', mealPlanController.getUserMealPlans);
router.post('/', mealPlanController.createMealPlan);
router.get('/:id', mealPlanController.getMealPlan);
router.post('/:id/meals', mealPlanController.addMealToPlan);
router.delete('/:id/meals/:mealId', mealPlanController.removeMealFromPlan);

export default router;







