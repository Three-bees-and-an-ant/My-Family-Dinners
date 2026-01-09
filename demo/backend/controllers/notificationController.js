import * as notificationService from '../services/notificationService.js';
import { consoleLog } from '../utils/logger.js';

export const getUserNotifications = async (req, res) => {
    try {
        const { unread_only } = req.query;
        const notifications = await notificationService.getUserNotifications(
            req.user.id,
            unread_only === 'true'
        );
        res.json(notifications);
    } catch (error) {
        consoleLog(`Error getting notifications: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        await notificationService.markNotificationAsRead(req.params.id, req.user.id);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        consoleLog(`Error marking notification as read: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await notificationService.markAllNotificationsAsRead(req.user.id);
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        consoleLog(`Error marking all notifications as read: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

