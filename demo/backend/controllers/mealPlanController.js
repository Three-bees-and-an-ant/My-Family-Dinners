import * as mealPlanService from '../services/mealPlanService.js';
import { consoleLog } from '../utils/logger.js';

export const getUserMealPlans = async (req, res) => {
    try {
        const plans = await mealPlanService.getUserMealPlans(req.user.id);
        res.json(plans);
    } catch (error) {
        consoleLog(`Error getting meal plans: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const createMealPlan = async (req, res) => {
    try {
        const plan = await mealPlanService.createMealPlan(req.user.id, req.body);
        consoleLog(`Meal plan created: ${plan.id}`, 'success');
        res.status(201).json(plan);
    } catch (error) {
        consoleLog(`Error creating meal plan: ${error.message}`, 'error');
        res.status(400).json({ error: error.message });
    }
};

export const getMealPlan = async (req, res) => {
    try {
        const plan = await mealPlanService.getMealPlanById(req.params.id);
        if (!plan) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }
        res.json(plan);
    } catch (error) {
        consoleLog(`Error getting meal plan: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const addMealToPlan = async (req, res) => {
    try {
        const mealId = await mealPlanService.addMealToPlan(req.params.id, req.body);
        consoleLog(`Meal added to plan: ${req.params.id}`, 'success');
        res.status(201).json({ id: mealId, message: 'Meal added successfully' });
    } catch (error) {
        consoleLog(`Error adding meal to plan: ${error.message}`, 'error');
        res.status(400).json({ error: error.message });
    }
};

export const removeMealFromPlan = async (req, res) => {
    try {
        await mealPlanService.removeMealFromPlan(req.params.id, req.params.mealId);
        consoleLog(`Meal removed from plan: ${req.params.id}`, 'success');
        res.json({ message: 'Meal removed successfully' });
    } catch (error) {
        consoleLog(`Error removing meal from plan: ${error.message}`, 'error');
        res.status(400).json({ error: error.message });
    }
};







