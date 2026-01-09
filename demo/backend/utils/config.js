import dotenv from 'dotenv';

dotenv.config();

/**
 * Validate required environment variables
 */
const requiredEnvVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_USER',
    'DB_NAME'
];

export const validateConfig = () => {
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate JWT_SECRET strength in production
    if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long in production');
    }
};

/**
 * Get configuration with defaults
 */
export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'family_meals',
        port: process.env.DB_PORT || 3306,
        socketPath: process.env.DB_SOCKET_PATH
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    }
};

// Validate on import
try {
    validateConfig();
} catch (error) {
    console.warn('⚠️  Config validation warning:', error.message);
}

export default config;




