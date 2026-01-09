import { consoleLog } from '../utils/logger.js';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    consoleLog(`Error: ${err.message}`, 'error');
    if (err.stack) {
        console.error(err.stack);
    }

    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        const message = 'Duplicate entry. This record already exists.';
        error = new AppError(message, 400);
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        const message = 'Referenced record does not exist.';
        error = new AppError(message, 400);
    }

    // Database connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        const message = 'Cannot connect to MySQL database. Please ensure MySQL is running and check your .env configuration.';
        error = new AppError(message, 503);
    }

    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ENOTFOUND') {
        const message = 'MySQL connection lost. Please check if MySQL server is running.';
        error = new AppError(message, 503);
    }

    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        const message = 'MySQL access denied. Please check your database credentials in .env file.';
        error = new AppError(message, 503);
    }

    if (err.code === 'ER_BAD_DB_ERROR') {
        const message = 'Database does not exist. Please run: cd backend && npm run seed';
        error = new AppError(message, 503);
    }

    if (err.code === 'ER_NO_SUCH_TABLE') {
        const message = 'Database table not found. Please run database migrations: cd backend && npm run seed';
        error = new AppError(message, 503);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please login again.';
        error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Please login again.';
        error = new AppError(message, 401);
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Async handler wrapper to catch errors in async routes
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};




