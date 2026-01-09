import pool from '../database/connection.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';

/**
 * Register a new user
 */
export const register = async (name, email, password, role = 'user') => {
    try {
        // Check if user already exists
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            throw new Error('User already exists with this email');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)',
            [name, email, passwordHash, role]
        );

        const userId = result.insertId;

        // Get created user (without password)
        const [users] = await pool.execute(
            'SELECT id, name, email, role FROM users WHERE id = ?',
            [userId]
        );

        const user = users[0];
        const token = generateToken(user);

        return { user, token };
    } catch (error) {
        // Provide more helpful error messages for database issues
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            throw new Error('Cannot connect to database. Please ensure MySQL is running: brew services start mysql');
        }
        if (error.code === 'ER_BAD_DB_ERROR') {
            throw new Error('Database does not exist. Please run: cd backend && npm run seed');
        }
        if (error.code === 'ER_NO_SUCH_TABLE') {
            throw new Error('Database tables not found. Please run: cd backend && npm run seed');
        }
        throw error;
    }
};

/**
 * Login user
 */
export const login = async (email, password) => {
    try {
        // Find user
        const [users] = await pool.execute(
            'SELECT id, name, email, passwordHash, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            throw new Error('Invalid email or password');
        }

        const user = users[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        // Remove password from response
        delete user.passwordHash;

        const token = generateToken(user);

        return { user, token };
    } catch (error) {
        // Provide more helpful error messages for database issues
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            throw new Error('Cannot connect to database. Please ensure MySQL is running: brew services start mysql');
        }
        if (error.code === 'ER_BAD_DB_ERROR') {
            throw new Error('Database does not exist. Please run: cd backend && npm run seed');
        }
        if (error.code === 'ER_NO_SUCH_TABLE') {
            throw new Error('Database tables not found. Please run: cd backend && npm run seed');
        }
        // Don't expose database errors for login - keep security
        if (error.message.includes('Invalid email or password')) {
            throw error; // Re-throw auth errors as-is
        }
        throw error;
    }
};

