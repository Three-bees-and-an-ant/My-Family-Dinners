import pool from '../database/connection.js';

/**
 * Log admin actions to database
 * @param {string} action - Action description
 * @param {string} actorRole - Role of the actor
 * @param {number} actorId - ID of the actor
 * @param {string} details - Additional details
 */
export const logAction = async (action, actorRole, actorId = null, details = null) => {
    try {
        await pool.execute(
            'INSERT INTO logs (action, actor_role, actor_id, details) VALUES (?, ?, ?, ?)',
            [action, actorRole, actorId, details]
        );
    } catch (error) {
        console.error('Error logging action:', error);
    }
};

/**
 * Console log with timestamp
 */
export const consoleLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
};

