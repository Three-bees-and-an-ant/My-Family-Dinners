import pool from '../database/connection.js';
import bcrypt from 'bcryptjs';
import { consoleLog } from '../utils/logger.js';

/**
 * Seed database with demo data - Healthy Family Meals
 */
async function seed() {
    try {
        consoleLog('🌱 Starting database seed...', 'info');

        // Create demo users
        const passwordHash = await bcrypt.hash('password123', 10);

        // Demo End User
        const [userResult] = await pool.execute(
            'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)',
            ['John Family', 'user@demo.com', passwordHash, 'user']
        );
        const userId = userResult.insertId;
        consoleLog('✅ Created demo user: user@demo.com / password123', 'success');

        // Demo Staff
        const [staffResult] = await pool.execute(
            'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)',
            ['Restaurant Staff', 'staff@demo.com', passwordHash, 'staff']
        );
        const staffId = staffResult.insertId;
        consoleLog('✅ Created demo staff: staff@demo.com / password123', 'success');

        // Demo Admin
        const [adminResult] = await pool.execute(
            'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)',
            ['System Admin', 'admin@demo.com', passwordHash, 'admin']
        );
        const adminId = adminResult.insertId;
        consoleLog('✅ Created demo admin: admin@demo.com / password123', 'success');

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
        startDate.setDate(1); // First day of current month
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of current month

        const [planResult] = await pool.execute(
            'INSERT INTO meal_plans (user_id, plan_name, start_date, end_date, total_calories_per_day, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, 'January Healthy Meal Plan', startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], 2000, 'Balanced meals for the whole family']
        );
        const planId = planResult.insertId;
        consoleLog('✅ Created sample monthly meal plan', 'success');

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

        // Create a sample scheduled order (24+ hours ahead)
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 1);
        scheduledDate.setHours(19, 0, 0, 0); // Tomorrow at 7 PM

        const [orderResult] = await pool.execute(
            'INSERT INTO orders (user_id, status, scheduled_date, is_scheduled, total_amount) VALUES (?, ?, ?, ?, ?)',
            [userId, 'pending', scheduledDate, true, 39.48]
        );
        const orderId = orderResult.insertId;

        // Add items to order
        await pool.execute(
            'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
            [orderId, menuItemIds[0], 1, menuItems[0].price]
        );
        await pool.execute(
            'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
            [orderId, menuItemIds[3], 1, menuItems[3].price]
        );

        consoleLog('✅ Created sample scheduled order', 'success');

        // Create sample notifications
        await pool.execute(
            'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
            [userId, 'Welcome to The Family Meals! Plan healthy meals for your family monthly.', 'order_confirmation']
        );
        await pool.execute(
            'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
            [userId, `Your order #${orderId} is pending confirmation.`, 'order_confirmation']
        );

        consoleLog('✅ Created sample notifications', 'success');

        // Create sample admin log
        await pool.execute(
            'INSERT INTO logs (action, actor_role, actor_id, details) VALUES (?, ?, ?, ?)',
            ['System initialized', 'admin', adminId, JSON.stringify({ timestamp: new Date().toISOString() })]
        );

        consoleLog('✅ Created sample admin log', 'success');
        consoleLog('🎉 Database seed completed successfully!', 'success');
        consoleLog('\n📋 Demo Credentials:', 'info');
        consoleLog('   User:  user@demo.com / password123', 'info');
        consoleLog('   Staff: staff@demo.com / password123', 'info');
        consoleLog('   Admin: admin@demo.com / password123', 'info');
        consoleLog('\n🥗 Healthy meals with nutritional info have been added!', 'success');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seed();
