-- Performance Optimization: Add indexes for frequently queried columns
-- This improves query performance significantly

USE family_meals;

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Indexes for menu_items table
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_healthy ON menu_items(is_healthy);

-- Indexes for orders table
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_scheduled_date ON orders(scheduled_date);
CREATE INDEX idx_orders_created_at ON orders(createdAt);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Indexes for order_items table
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);

-- Indexes for notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(createdAt);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Indexes for logs table
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_actor_role ON logs(actor_role);
CREATE INDEX idx_logs_actor_id ON logs(actor_id);

-- Indexes for meal_plans table
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_dates ON meal_plans(start_date, end_date);
CREATE INDEX idx_meal_plans_active ON meal_plans(is_active);

-- Indexes for meal_plan_items table
CREATE INDEX idx_meal_plan_items_date ON meal_plan_items(scheduled_date);
CREATE INDEX idx_meal_plan_items_meal_type ON meal_plan_items(meal_type);
CREATE INDEX idx_meal_plan_items_menu_item ON meal_plan_items(menu_item_id);

-- Indexes for family_members table
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
