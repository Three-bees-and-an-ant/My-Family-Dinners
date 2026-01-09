import * as schedulingService from '../services/schedulingService.js';
import { consoleLog } from '../utils/logger.js';

export const getRestaurantHours = async (req, res) => {
    try {
        const hours = await schedulingService.getRestaurantHours();
        res.json(hours);
    } catch (error) {
        consoleLog(`Error getting restaurant hours: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const getAvailableTimeSlots = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Date parameter is required' });
        }

        const slots = await schedulingService.getAvailableTimeSlots(date);
        res.json({ date, slots });
    } catch (error) {
        consoleLog(`Error getting time slots: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

export const validateScheduledDate = async (req, res) => {
    try {
        const { scheduled_date } = req.body;
        if (!scheduled_date) {
            return res.status(400).json({ error: 'Scheduled date is required' });
        }

        await schedulingService.validateScheduledDate(scheduled_date);
        res.json({ valid: true, message: 'Scheduled date is valid' });
    } catch (error) {
        res.status(400).json({ valid: false, error: error.message });
    }
};

