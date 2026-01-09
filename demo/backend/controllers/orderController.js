import * as orderService from '../services/orderService.js';
import * as schedulingService from '../services/schedulingService.js';
import { consoleLog } from '../utils/logger.js';

export const createOrder = async (req, res) => {
    try {
        const { items, scheduled_date, is_scheduled } = req.body;
        const userId = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items array is required' });
        }

        if (!scheduled_date) {
            return res.status(400).json({ error: 'Scheduled date is required' });
        }

        // Validate scheduled date if it's a scheduled order
        if (is_scheduled) {
            await schedulingService.validateScheduledDate(scheduled_date);
        }

        const order = await orderService.createOrder(userId, items, scheduled_date, is_scheduled || false);
        consoleLog(`Order created: #${order.id} by user ${userId}`, 'success');

        res.status(201).json(order);
    } catch (error) {
        consoleLog(`Error creating order: ${error.message}`, 'error');
        res.status(400).json({ error: error.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await orderService.getUserOrders(req.user.id);
        res.json(orders);
    } catch (error) {
        consoleLog(`Error getting user orders: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const getOrder = async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Users can only see their own orders
        if (req.user.role === 'user' && order.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(order);
    } catch (error) {
        consoleLog(`Error getting order: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await orderService.cancelOrder(req.params.id, req.user.id);
        consoleLog(`Order cancelled: #${req.params.id} by user ${req.user.id}`, 'success');
        res.json(order);
    } catch (error) {
        consoleLog(`Error cancelling order: ${error.message}`, 'error');
        res.status(400).json({ error: error.message });
    }
};

export const getPendingOrders = async (req, res) => {
    try {
        const orders = await orderService.getPendingOrders();
        res.json(orders);
    } catch (error) {
        consoleLog(`Error getting pending orders: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const confirmOrder = async (req, res) => {
    try {
        const order = await orderService.confirmOrder(req.params.id);
        
        // Process mock payment (always success for demo)
        await orderService.processPayment(req.params.id, true);
        
        consoleLog(`Order confirmed: #${req.params.id} by staff ${req.user.id}`, 'success');
        res.json(order);
    } catch (error) {
        consoleLog(`Error confirming order: ${error.message}`, 'error');
        res.status(400).json({ error: error.message });
    }
};

export const rejectOrder = async (req, res) => {
    try {
        const order = await orderService.rejectOrder(req.params.id);
        consoleLog(`Order rejected: #${req.params.id} by staff ${req.user.id}`, 'success');
        res.json(order);
    } catch (error) {
        consoleLog(`Error rejecting order: ${error.message}`, 'error');
        res.status(400).json({ error: error.message });
    }
};

