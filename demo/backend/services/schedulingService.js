import pool from '../database/connection.js';

/**
 * Get restaurant hours
 */
export const getRestaurantHours = async () => {
    try {
        const [settings] = await pool.execute(
            'SELECT * FROM restaurant_settings LIMIT 1'
        );
        return settings[0] || { opening_hour: '09:00:00', closing_hour: '22:00:00', is_enabled: true };
    } catch (error) {
        throw error;
    }
};

/**
 * Check if restaurant is enabled
 */
export const isRestaurantEnabled = async () => {
    try {
        const [settings] = await pool.execute(
            'SELECT is_enabled FROM restaurant_settings LIMIT 1'
        );
        return settings[0]?.is_enabled ?? true;
    } catch (error) {
        return true; // Default to enabled if error
    }
};

/**
 * Validate scheduled date (24h-30 days ahead, within restaurant hours)
 */
export const validateScheduledDate = async (scheduledDate) => {
    try {
        const now = new Date();
        const scheduled = new Date(scheduledDate);
        const hours = await getRestaurantHours();

        // Check if restaurant is enabled
        const enabled = await isRestaurantEnabled();
        if (!enabled) {
            throw new Error('Restaurant is currently disabled');
        }

        // Check if date is at least 24 hours ahead
        const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        if (scheduled < minDate) {
            throw new Error('Scheduled date must be at least 24 hours ahead');
        }

        // Check if date is within 30 days
        const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (scheduled > maxDate) {
            throw new Error('Scheduled date cannot be more than 30 days ahead');
        }

        // Check if within restaurant hours
        const scheduledHour = scheduled.getHours();
        const scheduledMinute = scheduled.getMinutes();
        const scheduledTime = `${String(scheduledHour).padStart(2, '0')}:${String(scheduledMinute).padStart(2, '0')}:00`;

        const openingHour = parseInt(hours.opening_hour.split(':')[0]);
        const closingHour = parseInt(hours.closing_hour.split(':')[0]);

        if (scheduledHour < openingHour || scheduledHour >= closingHour) {
            throw new Error(`Scheduled time must be between ${hours.opening_hour} and ${hours.closing_hour}`);
        }

        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Get available time slots for a given date
 */
export const getAvailableTimeSlots = async (date) => {
    try {
        const hours = await getRestaurantHours();
        const openingHour = parseInt(hours.opening_hour.split(':')[0]);
        const closingHour = parseInt(hours.closing_hour.split(':')[0]);

        const slots = [];
        for (let hour = openingHour; hour < closingHour; hour++) {
            slots.push(`${String(hour).padStart(2, '0')}:00`);
            slots.push(`${String(hour).padStart(2, '0')}:30`);
        }

        return slots;
    } catch (error) {
        throw error;
    }
};

