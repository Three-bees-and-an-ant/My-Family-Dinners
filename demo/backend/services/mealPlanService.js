import pool from '../database/connection.js';

/**
 * Get meal plans for a user
 */
export const getUserMealPlans = async (userId) => {
    try {
        const [plans] = await pool.execute(
            'SELECT * FROM meal_plans WHERE user_id = ? ORDER BY start_date DESC',
            [userId]
        );

        // Get meals for each plan
        for (const plan of plans) {
            const [meals] = await pool.execute(
                `SELECT mpi.*, mi.name as menu_item_name, mi.calories, mi.protein_g 
                 FROM meal_plan_items mpi 
                 JOIN menu_items mi ON mpi.menu_item_id = mi.id 
                 WHERE mpi.meal_plan_id = ? 
                 ORDER BY mpi.scheduled_date, mpi.meal_type`,
                [plan.id]
            );
            plan.meals = meals;
        }

        return plans;
    } catch (error) {
        throw error;
    }
};

/**
 * Create a new meal plan
 */
export const createMealPlan = async (userId, planData) => {
    try {
        const { plan_name, start_date, end_date, total_calories_per_day, notes } = planData;
        
        const [result] = await pool.execute(
            'INSERT INTO meal_plans (user_id, plan_name, start_date, end_date, total_calories_per_day, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, plan_name, start_date, end_date, total_calories_per_day || null, notes || null]
        );

        return await getMealPlanById(result.insertId);
    } catch (error) {
        throw error;
    }
};

/**
 * Get meal plan by ID
 */
export const getMealPlanById = async (planId) => {
    try {
        const [plans] = await pool.execute(
            'SELECT * FROM meal_plans WHERE id = ?',
            [planId]
        );

        if (plans.length === 0) {
            return null;
        }

        const plan = plans[0];
        const [meals] = await pool.execute(
            `SELECT mpi.*, mi.name as menu_item_name, mi.calories, mi.protein_g 
             FROM meal_plan_items mpi 
             JOIN menu_items mi ON mpi.menu_item_id = mi.id 
             WHERE mpi.meal_plan_id = ? 
             ORDER BY mpi.scheduled_date, mpi.meal_type`,
            [planId]
        );
        plan.meals = meals;

        return plan;
    } catch (error) {
        throw error;
    }
};

/**
 * Add meal to plan
 */
export const addMealToPlan = async (planId, mealData) => {
    try {
        const { menu_item_id, scheduled_date, meal_type, quantity, notes } = mealData;
        
        const [result] = await pool.execute(
            'INSERT INTO meal_plan_items (meal_plan_id, menu_item_id, scheduled_date, meal_type, quantity, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [planId, menu_item_id, scheduled_date, meal_type || 'dinner', quantity || 1, notes || null]
        );

        return result.insertId;
    } catch (error) {
        throw error;
    }
};

/**
 * Remove meal from plan
 */
export const removeMealFromPlan = async (planId, mealItemId) => {
    try {
        await pool.execute(
            'DELETE FROM meal_plan_items WHERE id = ? AND meal_plan_id = ?',
            [mealItemId, planId]
        );
        return true;
    } catch (error) {
        throw error;
    }
};







