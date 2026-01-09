import pool from '../database/connection.js';
import { createNotification } from './notificationService.js';

/**
 * Create a new order
 */
export const createOrder = async (userId, items, scheduledDate, isScheduled = false) => {
    try {
        // Calculate total
        let totalAmount = 0;
        const menuItems = [];

        for (const item of items) {
            const [menuItemsResult] = await pool.execute(
                'SELECT * FROM menu_items WHERE id = ? AND is_available = TRUE',
                [item.menu_item_id]
            );

            if (menuItemsResult.length === 0) {
                throw new Error(`Menu item ${item.menu_item_id} not found or unavailable`);
            }

            const menuItem = menuItemsResult[0];
            totalAmount += menuItem.price * item.quantity;
            menuItems.push({ ...menuItem, quantity: item.quantity });
        }

        // Create order
        const [orderResult] = await pool.execute(
            'INSERT INTO orders (user_id, status, scheduled_date, is_scheduled, total_amount) VALUES (?, ?, ?, ?, ?)',
            [userId, 'pending', scheduledDate, isScheduled, totalAmount]
        );

        const orderId = orderResult.insertId;

        // Create order items
        for (const item of items) {
            const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
            await pool.execute(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                [orderId, item.menu_item_id, item.quantity, menuItem.price]
            );
        }

        // Get full order with items
        const order = await getOrderById(orderId);

        return order;
    } catch (error) {
        throw error;
    }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
    try {
        const [orders] = await pool.execute(
            `SELECT o.*, u.name as user_name, u.email as user_email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.id = ?`,
            [orderId]
        );

        if (orders.length === 0) {
            return null;
        }

        const order = orders[0];

        // Get order items
        const [items] = await pool.execute(
            `SELECT oi.*, mi.name as menu_item_name, mi.serving_size 
             FROM order_items oi 
             JOIN menu_items mi ON oi.menu_item_id = mi.id 
             WHERE oi.order_id = ?`,
            [orderId]
        );

        order.items = items;
        return order;
    } catch (error) {
        throw error;
    }
};

/**
 * Get orders for a user
 */
export const getUserOrders = async (userId) => {
    try {
        const [orders] = await pool.execute(
            `SELECT o.*, 
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
             FROM orders o 
             WHERE o.user_id = ? 
             ORDER BY o.createdAt DESC`,
            [userId]
        );

        // Get items for each order
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
 * Get all pending orders (for staff)
 */
export const getPendingOrders = async () => {
    try {
        const [orders] = await pool.execute(
            `SELECT o.*, u.name as user_name, u.email as user_email 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.status = 'pending' 
             ORDER BY o.createdAt ASC`
        );

        for (const order of orders) {
            const [items] = await pool.execute(
                `SELECT oi.*, mi.name as menu_item_name, mi.serving_size 
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
 * Confirm order (staff only)
 */
export const confirmOrder = async (orderId) => {
    try {
        await pool.execute(
            'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
            ['confirmed', 'success', orderId]
        );

        const order = await getOrderById(orderId);

        // Create notification
        await createNotification(
            order.user_id,
            `Your order #${orderId} has been confirmed! Scheduled for ${new Date(order.scheduled_date).toLocaleString()}`,
            'order_confirmation'
        );

        return order;
    } catch (error) {
        throw error;
    }
};

/**
 * Reject order (staff only)
 */
export const rejectOrder = async (orderId) => {
    try {
        await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            ['rejected', orderId]
        );

        const order = await getOrderById(orderId);

        // Create notification
        await createNotification(
            order.user_id,
            `Your order #${orderId} has been rejected. Please contact support.`,
            'order_rejection'
        );

        return order;
    } catch (error) {
        throw error;
    }
};

/**
 * Cancel order (user only, before confirmation)
 */
export const cancelOrder = async (orderId, userId) => {
    try {
        // Check if order belongs to user and is still pending
        const [orders] = await pool.execute(
            'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = ?',
            [orderId, userId, 'pending']
        );

        if (orders.length === 0) {
            throw new Error('Order not found or cannot be cancelled');
        }

        await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            ['cancelled', orderId]
        );

        const order = await getOrderById(orderId);

        // Create notification
        await createNotification(
            userId,
            `Your order #${orderId} has been cancelled.`,
            'cancellation'
        );

        return order;
    } catch (error) {
        throw error;
    }
};

/**
 * Process mock payment
 */
export const processPayment = async (orderId, success = true) => {
    try {
        const status = success ? 'success' : 'failed';
        await pool.execute(
            'UPDATE orders SET payment_status = ? WHERE id = ?',
            [status, orderId]
        );

        const order = await getOrderById(orderId);

        if (!success) {
            await createNotification(
                order.user_id,
                `Payment failed for order #${orderId}. Please try again.`,
                'payment_failed'
            );
        }

        return order;
    } catch (error) {
        throw error;
    }
};

