import pool from '../database/connection.js';
import { consoleLog } from '../utils/logger.js';

/**
 * Create a notification for a user
 */
export const createNotification = async (userId, message, type = 'order_confirmation') => {
    try {
        const [result] = await pool.execute(
            'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
            [userId, message, type]
        );

        // Simulate notification (console log for demo)
        consoleLog(`📧 Notification sent to user ${userId}: ${message}`, 'info');

        return result.insertId;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId, unreadOnly = false) => {
    try {
        let query = 'SELECT * FROM notifications WHERE user_id = ?';
        const params = [userId];

        if (unreadOnly) {
            query += ' AND is_read = FALSE';
        }

        query += ' ORDER BY createdAt DESC LIMIT 50';

        const [notifications] = await pool.execute(query, params);
        return notifications;
    } catch (error) {
        throw error;
    }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId, userId) => {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );
        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId) => {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Simulate reminder notifications (60 min and 30 min before scheduled time)
 * This would typically run as a scheduled job/cron
 */
export const checkAndSendReminders = async () => {
    try {
        const now = new Date();
        const in60Min = new Date(now.getTime() + 60 * 60 * 1000);
        const in30Min = new Date(now.getTime() + 30 * 60 * 1000);

        // Find orders scheduled in 60 minutes
        const [orders60] = await pool.execute(
            `SELECT o.*, u.id as user_id 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.status = 'confirmed' 
             AND o.scheduled_date BETWEEN ? AND ? 
             AND o.id NOT IN (
                 SELECT DISTINCT CAST(JSON_EXTRACT(details, '$.order_id') AS UNSIGNED)
                 FROM logs 
                 WHERE action = 'reminder_60min_sent'
                 AND timestamp > DATE_SUB(NOW(), INTERVAL 1 HOUR)
             )`,
            [now, in60Min]
        );

        for (const order of orders60) {
            await createNotification(
                order.user_id,
                `Reminder: Your order #${order.id} is scheduled in 60 minutes!`,
                'reminder_60min'
            );
            consoleLog(`⏰ 60-min reminder sent for order #${order.id}`, 'info');
        }

        // Find orders scheduled in 30 minutes
        const [orders30] = await pool.execute(
            `SELECT o.*, u.id as user_id 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.status = 'confirmed' 
             AND o.scheduled_date BETWEEN ? AND ? 
             AND o.id NOT IN (
                 SELECT DISTINCT CAST(JSON_EXTRACT(details, '$.order_id') AS UNSIGNED)
                 FROM logs 
                 WHERE action = 'reminder_30min_sent'
                 AND timestamp > DATE_SUB(NOW(), INTERVAL 1 HOUR)
             )`,
            [now, in30Min]
        );

        for (const order of orders30) {
            await createNotification(
                order.user_id,
                `Reminder: Your order #${order.id} is scheduled in 30 minutes!`,
                'reminder_30min'
            );
            consoleLog(`⏰ 30-min reminder sent for order #${order.id}`, 'info');
        }
    } catch (error) {
        console.error('Error checking reminders:', error);
    }
};

/**
 * Auto-notify user if no staff response in 5 minutes (mock)
 * This would typically run as a scheduled job/cron
 */
export const checkPendingOrdersTimeout = async () => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const [orders] = await pool.execute(
            `SELECT o.*, u.id as user_id 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.status = 'pending' 
             AND o.createdAt < ? 
             AND o.id NOT IN (
                 SELECT DISTINCT CAST(JSON_EXTRACT(details, '$.order_id') AS UNSIGNED)
                 FROM logs 
                 WHERE action = 'auto_notify_sent'
                 AND timestamp > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
             )`,
            [fiveMinutesAgo]
        );

        for (const order of orders) {
            await createNotification(
                order.user_id,
                `Your order #${order.id} is still pending. Our staff will respond shortly.`,
                'auto_notify'
            );
            consoleLog(`🔔 Auto-notify sent for pending order #${order.id}`, 'info');
        }
    } catch (error) {
        console.error('Error checking pending orders timeout:', error);
    }
};

