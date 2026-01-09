-- ============================================
-- The Family Meals - Complete Database
-- ============================================
-- This file contains ALL tables and ALL data
-- Created: 2024
-- Usage: mysql -u root < family_meals_complete.sql
-- ============================================
-- 
-- IMPORTANT: After importing, run:
--   cd backend && npm run seed
-- This will create users with proper password hashes
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS family_meals;
USE family_meals;

-- ============================================
-- TABLE STRUCTURES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    role ENUM('user', 'staff', 'admin') NOT NULL DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Menu items table (with nutritional info)
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    serving_size VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    calories INT,
    protein_g DECIMAL(10, 2),
    carbs_g DECIMAL(10, 2),
    fat_g DECIMAL(10, 2),
    fiber_g DECIMAL(10, 2),
    weight_g INT,
    is_healthy BOOLEAN DEFAULT TRUE,
    allergens VARCHAR(255),
    prep_time_minutes INT,
    image_url VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    scheduled_date DATETIME NOT NULL,
    is_scheduled BOOLEAN DEFAULT FALSE,
    payment_status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10, 2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type ENUM('order_confirmation', 'order_rejection', 'reminder_60min', 'reminder_30min', 'cancellation', 'payment_failed', 'auto_notify') DEFAULT 'order_confirmation',
    is_read BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Logs table (for admin actions)
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    actor_id INT,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant settings table
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT TRUE,
    opening_hour TIME DEFAULT '09:00:00',
    closing_hour TIME DEFAULT '22:00:00',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_calories_per_day INT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Meal plan items table
CREATE TABLE IF NOT EXISTS meal_plan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_plan_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') DEFAULT 'dinner',
    quantity INT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Family members table
CREATE TABLE IF NOT EXISTS family_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INT,
    daily_calorie_goal INT,
    allergies VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES (for performance)
-- ============================================
-- Note: Indexes are created here. If they already exist, you'll get an error.
-- To avoid errors, either:
-- 1. Drop the database first: DROP DATABASE IF EXISTS family_meals;
-- 2. Or use: mysql -u root --force < family_meals_complete.sql
-- 3. Or manually drop indexes before importing

-- Create indexes (will fail silently if using --force flag)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_scheduled_date ON orders(scheduled_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plan_items_meal_plan_id ON meal_plan_items(meal_plan_id);

-- ============================================
-- INSERT DATA
-- ============================================

-- Insert default restaurant settings
INSERT INTO restaurant_settings (is_enabled, opening_hour, closing_hour) 
VALUES (TRUE, '09:00:00', '22:00:00')
ON DUPLICATE KEY UPDATE id=id;

-- Insert menu items (12 healthy meals with nutritional info)
INSERT INTO menu_items (name, price, serving_size, category, description, calories, protein_g, carbs_g, fat_g, fiber_g, weight_g, is_healthy, allergens, prep_time_minutes) VALUES
('Grilled Salmon with Vegetables', 22.99, 'Family Size (4 servings)', 'Main Course', 'Fresh Atlantic salmon grilled to perfection with seasonal vegetables. Rich in Omega-3 and protein.', 450, 35.0, 15.0, 28.0, 4.0, 600, TRUE, 'Fish', 25),
('Quinoa Power Bowl', 16.50, 'Family Bowl (4-5 servings)', 'Main Course', 'Organic quinoa with roasted vegetables, chickpeas, avocado, and tahini dressing. Complete protein source.', 380, 18.0, 55.0, 12.0, 8.0, 800, TRUE, 'None', 20),
('Turkey Meatballs with Whole Wheat Pasta', 18.75, 'Family Size (4-6 servings)', 'Main Course', 'Lean turkey meatballs with whole wheat pasta and marinara sauce. High protein, low fat.', 420, 32.0, 45.0, 12.0, 6.0, 900, TRUE, 'Wheat, Eggs', 35),
('Mediterranean Chicken Salad', 15.99, 'Family Bowl (4 servings)', 'Salad', 'Grilled chicken breast with mixed greens, olives, feta cheese, and olive oil dressing.', 320, 28.0, 12.0, 18.0, 5.0, 600, TRUE, 'Dairy', 15),
('Vegetable Stir Fry with Tofu', 14.50, 'Family Size (4 servings)', 'Main Course', 'Fresh vegetables stir-fried with organic tofu in light soy sauce. Vegan and protein-rich.', 280, 20.0, 25.0, 10.0, 7.0, 700, TRUE, 'Soy', 20),
('Lentil Soup', 9.99, 'Family Pot (6 servings)', 'Soup', 'Hearty lentil soup with vegetables. High in fiber and plant-based protein.', 180, 12.0, 30.0, 3.0, 10.0, 1200, TRUE, 'None', 30),
('Greek Yogurt Parfait', 8.50, '4 portions', 'Dessert', 'Greek yogurt with fresh berries, granola, and honey. High protein, probiotic-rich.', 220, 15.0, 30.0, 5.0, 4.0, 400, TRUE, 'Dairy', 10),
('Baked Sweet Potato Fries', 7.99, 'Family Size (4 servings)', 'Side Dish', 'Baked sweet potato fries with herbs. Rich in beta-carotene and fiber.', 200, 3.0, 45.0, 4.0, 6.0, 500, TRUE, 'None', 25),
('Whole Grain Chicken Wrap', 12.99, '4 wraps', 'Main Course', 'Grilled chicken in whole grain wrap with vegetables and hummus.', 350, 25.0, 40.0, 10.0, 8.0, 600, TRUE, 'Wheat', 15),
('Overnight Oats', 6.99, '4 portions', 'Breakfast', 'Overnight oats with chia seeds, berries, and almond milk. Perfect for busy mornings.', 250, 10.0, 45.0, 6.0, 9.0, 500, TRUE, 'Oats', 5),
('Baked Cod with Roasted Vegetables', 19.99, 'Family Size (4 servings)', 'Main Course', 'Fresh cod baked with lemon and herbs, served with roasted seasonal vegetables.', 280, 30.0, 20.0, 8.0, 5.0, 650, TRUE, 'Fish', 30),
('Chickpea Curry', 13.50, 'Family Pot (4-5 servings)', 'Main Course', 'Creamy chickpea curry with coconut milk, served with brown rice. Plant-based protein powerhouse.', 320, 15.0, 50.0, 8.0, 12.0, 1000, TRUE, 'None', 25)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 
-- 1. USERS: This SQL file does NOT include users with proper password hashes.
--    After importing this file, you MUST run:
--      cd backend && npm run seed
--    This will create users with proper bcrypt password hashes.
--
-- 2. Demo credentials (after running seed.js):
--    User:  user@demo.com / password123
--    Staff: staff@demo.com / password123
--    Admin: admin@demo.com / password123
--
-- 3. This file contains:
--    ✅ All table structures (10 tables)
--    ✅ All menu items (12 items with nutritional info)
--    ✅ Restaurant settings
--    ✅ All indexes
--
-- 4. Missing (will be created by seed.js):
--    ⚠️  Users (with proper password hashes)
--    ⚠️  Sample orders
--    ⚠️  Sample meal plans
--    ⚠️  Sample notifications
--
-- ============================================
