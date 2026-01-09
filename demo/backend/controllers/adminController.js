import * as adminService from '../services/adminService.js';
import { logAction } from '../utils/logger.js';
import { consoleLog } from '../utils/logger.js';

export const getSystemLogs = async (req, res) => {
    try {
        const { limit } = req.query;
        const logs = await adminService.getAllLogs(parseInt(limit) || 100);
        res.json(logs);
    } catch (error) {
        consoleLog(`Error getting system logs: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers();
        res.json(users);
    } catch (error) {
        consoleLog(`Error getting all users: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await adminService.getAllOrders();
        res.json(orders);
    } catch (error) {
        consoleLog(`Error getting all orders: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const setRestaurantStatus = async (req, res) => {
    try {
        const { isEnabled } = req.body;
        const result = await adminService.setRestaurantStatus(isEnabled, req.user.id);
        
        // Log admin action
        await logAction(
            `Restaurant ${isEnabled ? 'enabled' : 'disabled'}`,
            'admin',
            req.user.id,
            JSON.stringify({ isEnabled, timestamp: new Date().toISOString() })
        );

        consoleLog(`Restaurant ${isEnabled ? 'enabled' : 'disabled'} by admin ${req.user.id}`, 'success');
        res.json(result);
    } catch (error) {
        consoleLog(`Error setting restaurant status: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const getRestaurantStatus = async (req, res) => {
    try {
        const status = await adminService.getRestaurantStatus();
        res.json(status);
    } catch (error) {
        consoleLog(`Error getting restaurant status: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const getSystemStats = async (req, res) => {
    try {
        const stats = await adminService.getSystemStats();
        res.json(stats);
    } catch (error) {
        consoleLog(`Error getting system stats: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

