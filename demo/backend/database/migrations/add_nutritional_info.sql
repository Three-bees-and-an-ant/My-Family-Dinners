-- Migration: Add nutritional information and meal planning features
-- For healthy family meals application

USE family_meals;

-- Add nutritional information columns to menu_items (check if exists first)
ALTER TABLE menu_items 
ADD COLUMN calories INT DEFAULT 0,
ADD COLUMN protein_g DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN carbs_g DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN fat_g DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN fiber_g DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN weight_g INT DEFAULT 0,
ADD COLUMN image_url VARCHAR(500),
ADD COLUMN is_healthy BOOLEAN DEFAULT TRUE,
ADD COLUMN allergens TEXT,
ADD COLUMN prep_time_minutes INT DEFAULT 30;

-- Create meal_plans table for monthly meal planning
CREATE TABLE IF NOT EXISTS meal_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_calories_per_day INT,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create meal_plan_items table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS meal_plan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_plan_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') DEFAULT 'dinner',
    quantity INT DEFAULT 1,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    INDEX idx_meal_plan_date (meal_plan_id, scheduled_date)
);

-- Add family members table for tracking children's meals
CREATE TABLE IF NOT EXISTS family_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INT,
    dietary_preferences TEXT,
    allergies TEXT,
    daily_calorie_goal INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
