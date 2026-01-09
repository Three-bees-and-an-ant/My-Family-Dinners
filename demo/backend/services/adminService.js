import pool from '../database/connection.js';
import { logAction } from '../utils/logger.js';

/**
 * Get all system logs
 */
export const getAllLogs = async (limit = 100) => {
    try {
        const [logs] = await pool.execute(
            'SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?',
            [limit]
        );
        return logs;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all users
 */
export const getAllUsers = async () => {
    try {
        const [users] = await pool.execute(
            'SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC'
        );
        return users;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all orders
 */
export const getAllOrders = async () => {
    try {
        const [orders] = await pool.execute(
            `SELECT o.*, u.name as user_name, u.email as user_email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             ORDER BY o.createdAt DESC`
        );

        for (const order of orders) {
            const [items] = await pool.execute(
                `SELECT oi.*, mi.name as menu_item_name 
                 FROM order_items oi 
                 JOIN menu_items mi ON oi.menu_item_id = mi.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        return orders;
    } catch (error) {
        throw error;
    }
};

/**
 * Enable/disable restaurant
 */
export const setRestaurantStatus = async (isEnabled, adminId) => {
    try {
        await pool.execute(
            'UPDATE restaurant_settings SET is_enabled = ? WHERE id = 1',
            [isEnabled]
        );

        // Log admin action
        await logAction(
            `Restaurant ${isEnabled ? 'enabled' : 'disabled'}`,
            'admin',
            adminId,
            JSON.stringify({ isEnabled })
        );

        return { isEnabled };
    } catch (error) {
        throw error;
    }
};

/**
 * Get restaurant status
 */
export const getRestaurantStatus = async () => {
    try {
        const [settings] = await pool.execute(
            'SELECT is_enabled FROM restaurant_settings LIMIT 1'
        );
        return { isEnabled: settings[0]?.is_enabled ?? true };
    } catch (error) {
        throw error;
    }
};

/**
 * Get system statistics
 */
export const getSystemStats = async () => {
    try {
        const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [orderCount] = await pool.execute('SELECT COUNT(*) as count FROM orders');
        const [pendingOrderCount] = await pool.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
        const [menuItemCount] = await pool.execute('SELECT COUNT(*) as count FROM menu_items');

        return {
            totalUsers: userCount[0].count,
            totalOrders: orderCount[0].count,
            pendingOrders: pendingOrderCount[0].count,
            menuItems: menuItemCount[0].count
        };
    } catch (error) {
        throw error;
    }
};

