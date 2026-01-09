import pool from '../database/connection.js';
import { consoleLog } from '../utils/logger.js';

/**
 * Reseed menu items with healthy meals and nutritional info
 */
async function reseedMenu() {
    try {
        consoleLog('🔄 Reseeding menu items with healthy meals...', 'info');

        // Delete existing menu items
        await pool.execute('DELETE FROM order_items');
        await pool.execute('DELETE FROM orders');
        await pool.execute('DELETE FROM meal_plan_items');
        await pool.execute('DELETE FROM meal_plans');
        await pool.execute('DELETE FROM family_members');
        await pool.execute('DELETE FROM menu_items');
        consoleLog('✅ Cleared existing data', 'success');

        // Get user ID
        const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', ['user@demo.com']);
        const userId = users[0]?.id;

        // Create healthy menu items with nutritional information
        const menuItems = [
            {
                name: 'Grilled Salmon with Vegetables',
                price: 22.99,
                serving_size: 'Family Size (4 servings)',
                category: 'Main Course',
                description: 'Fresh Atlantic salmon grilled to perfection with seasonal vegetables. Rich in Omega-3 and protein.',
                calories: 450,
                protein_g: 35.0,
                carbs_g: 15.0,
                fat_g: 28.0,
                fiber_g: 4.0,
                weight_g: 600,
                is_healthy: true,
                allergens: 'Fish',
                prep_time_minutes: 25
            },
            {
                name: 'Quinoa Power Bowl',
                price: 16.50,
                serving_size: 'Family Bowl (4-5 servings)',
                category: 'Main Course',
                description: 'Organic quinoa with roasted vegetables, chickpeas, avocado, and tahini dressing. Complete protein source.',
                calories: 380,
                protein_g: 18.0,
                carbs_g: 55.0,
                fat_g: 12.0,
                fiber_g: 8.0,
                weight_g: 800,
                is_healthy: true,
                allergens: 'None',
                prep_time_minutes: 20
            },
            {
                name: 'Turkey Meatballs with Whole Wheat Pasta',
                price: 18.75,
                serving_size: 'Family Size (4-6 servings)',
                category: 'Main Course',
                description: 'Lean turkey meatballs with whole wheat pasta and marinara sauce. High protein, low fat.',
                calories: 420,
                protein_g: 32.0,
                carbs_g: 45.0,
                fat_g: 12.0,
                fiber_g: 6.0,
                weight_g: 900,
                is_healthy: true,
                allergens: 'Wheat, Eggs',
                prep_time_minutes: 35
            },
            {
                name: 'Mediterranean Chicken Salad',
                price: 15.99,
                serving_size: 'Family Bowl (4 servings)',
                category: 'Salad',
                description: 'Grilled chicken breast with mixed greens, olives, feta cheese, and olive oil dressing.',
                calories: 320,
                protein_g: 28.0,
                carbs_g: 12.0,
                fat_g: 18.0,
                fiber_g: 5.0,
                weight_g: 600,
                is_healthy: true,
                allergens: 'Dairy',
                prep_time_minutes: 15
            },
            {
                name: 'Vegetable Stir Fry with Tofu',
                price: 14.50,
                serving_size: 'Family Size (4 servings)',
                category: 'Main Course',
                description: 'Fresh vegetables stir-fried with organic tofu in light soy sauce. Vegan and protein-rich.',
                calories: 280,
                protein_g: 20.0,
                carbs_g: 25.0,
                fat_g: 10.0,
                fiber_g: 7.0,
                weight_g: 700,
                is_healthy: true,
                allergens: 'Soy',
                prep_time_minutes: 20
            },
            {
                name: 'Lentil Soup',
                price: 9.99,
                serving_size: 'Family Pot (6 servings)',
                category: 'Soup',
                description: 'Hearty lentil soup with vegetables. High in fiber and plant-based protein.',
                calories: 180,
                protein_g: 12.0,
                carbs_g: 30.0,
                fat_g: 3.0,
                fiber_g: 10.0,
                weight_g: 1200,
                is_healthy: true,
                allergens: 'None',
                prep_time_minutes: 30
            },
            {
                name: 'Greek Yogurt Parfait',
                price: 8.50,
                serving_size: '4 portions',
                category: 'Dessert',
                description: 'Greek yogurt with fresh berries, granola, and honey. High protein, probiotic-rich.',
                calories: 220,
                protein_g: 15.0,
                carbs_g: 30.0,
                fat_g: 5.0,
                fiber_g: 4.0,
                weight_g: 400,
                is_healthy: true,
                allergens: 'Dairy',
                prep_time_minutes: 10
            },
            {
                name: 'Baked Sweet Potato Fries',
                price: 7.99,
                serving_size: 'Family Size (4 servings)',
                category: 'Side Dish',
                description: 'Baked sweet potato fries with herbs. Rich in beta-carotene and fiber.',
                calories: 200,
                protein_g: 3.0,
                carbs_g: 45.0,
                fat_g: 4.0,
                fiber_g: 6.0,
                weight_g: 500,
                is_healthy: true,
                allergens: 'None',
                prep_time_minutes: 25
            },
            {
                name: 'Whole Grain Chicken Wrap',
                price: 12.99,
                serving_size: '4 wraps',
                category: 'Main Course',
                description: 'Grilled chicken in whole grain wrap with vegetables and hummus.',
                calories: 350,
                protein_g: 25.0,
                carbs_g: 40.0,
                fat_g: 10.0,
                fiber_g: 8.0,
                weight_g: 600,
                is_healthy: true,
                allergens: 'Wheat',
                prep_time_minutes: 15
            },
            {
                name: 'Overnight Oats',
                price: 6.99,
                serving_size: '4 portions',
                category: 'Breakfast',
                description: 'Overnight oats with chia seeds, berries, and almond milk. Perfect for busy mornings.',
                calories: 250,
                protein_g: 10.0,
                carbs_g: 45.0,
                fat_g: 6.0,
                fiber_g: 9.0,
                weight_g: 500,
                is_healthy: true,
                allergens: 'Oats',
                prep_time_minutes: 5
            },
            {
                name: 'Baked Cod with Roasted Vegetables',
                price: 19.99,
                serving_size: 'Family Size (4 servings)',
                category: 'Main Course',
                description: 'Fresh cod baked with lemon and herbs, served with roasted seasonal vegetables.',
                calories: 280,
                protein_g: 30.0,
                carbs_g: 20.0,
                fat_g: 8.0,
                fiber_g: 5.0,
                weight_g: 650,
                is_healthy: true,
                allergens: 'Fish',
                prep_time_minutes: 30
            },
            {
                name: 'Chickpea Curry',
                price: 13.50,
                serving_size: 'Family Pot (4-5 servings)',
                category: 'Main Course',
                description: 'Creamy chickpea curry with coconut milk, served with brown rice. Plant-based protein powerhouse.',
                calories: 320,
                protein_g: 15.0,
                carbs_g: 50.0,
                fat_g: 8.0,
                fiber_g: 12.0,
                weight_g: 1000,
                is_healthy: true,
                allergens: 'None',
                prep_time_minutes: 25
            }
        ];

        const menuItemIds = [];
        for (const item of menuItems) {
            const [result] = await pool.execute(
                `INSERT INTO menu_items 
                (name, price, serving_size, category, description, calories, protein_g, carbs_g, fat_g, fiber_g, weight_g, is_healthy, allergens, prep_time_minutes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    item.name, item.price, item.serving_size, item.category, item.description,
                    item.calories, item.protein_g, item.carbs_g, item.fat_g, item.fiber_g,
                    item.weight_g, item.is_healthy, item.allergens, item.prep_time_minutes
                ]
            );
            menuItemIds.push(result.insertId);
        }
        consoleLog(`✅ Created ${menuItems.length} healthy menu items with nutritional info`, 'success');

        // Create sample family members
        await pool.execute(
            'INSERT INTO family_members (user_id, name, age, daily_calorie_goal, allergies) VALUES (?, ?, ?, ?, ?)',
            [userId, 'Emma', 8, 1600, 'None']
        );
        await pool.execute(
            'INSERT INTO family_members (user_id, name, age, daily_calorie_goal, allergies) VALUES (?, ?, ?, ?, ?)',
            [userId, 'Lucas', 12, 2200, 'Nuts']
        );
        consoleLog('✅ Created sample family members', 'success');

        // Create a sample monthly meal plan
        const startDate = new Date();
        startDate.setDate(1);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);

        const [planResult] = await pool.execute(
            'INSERT INTO meal_plans (user_id, plan_name, start_date, end_date, total_calories_per_day, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, 'January Healthy Meal Plan', startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], 2000, 'Balanced meals for the whole family']
        );
        const planId = planResult.insertId;

        // Add some meals to the plan
        const sampleDate = new Date();
        sampleDate.setDate(sampleDate.getDate() + 1);
        await pool.execute(
            'INSERT INTO meal_plan_items (meal_plan_id, menu_item_id, scheduled_date, meal_type, quantity) VALUES (?, ?, ?, ?, ?)',
            [planId, menuItemIds[0], sampleDate.toISOString().split('T')[0], 'dinner', 1]
        );
        await pool.execute(
            'INSERT INTO meal_plan_items (meal_plan_id, menu_item_id, scheduled_date, meal_type, quantity) VALUES (?, ?, ?, ?, ?)',
            [planId, menuItemIds[1], sampleDate.toISOString().split('T')[0], 'lunch', 1]
        );
        consoleLog('✅ Created sample monthly meal plan', 'success');

        consoleLog('🎉 Menu reseed completed successfully!', 'success');
        process.exit(0);
    } catch (error) {
        console.error('❌ Reseed error:', error);
        process.exit(1);
    }
}

reseedMenu();







