import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow for demo
});

/**
 * Rate limiting for authentication endpoints
 * More lenient in development mode
 */
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 100, // 5 in production, 100 in development
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for localhost in development
        if (process.env.NODE_ENV !== 'production') {
            const ip = req.ip || req.connection?.remoteAddress;
            return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1' || !ip;
        }
        return false;
    }
});

/**
 * General API rate limiting
 * More lenient in development mode
 */
export const apiRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 in production, 1000 in development
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for localhost in development
        return process.env.NODE_ENV !== 'production' && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1');
    }
});

/**
 * Order creation rate limiting
 */
export const orderRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 orders per minute
    message: 'Too many order requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
});




