import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { existsSync } from 'fs';

dotenv.config();

// Database connection pool
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'family_meals',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // 10 seconds
};

// Try to use socket path on macOS if available (common MySQL installation)
// Only if DB_SOCKET_PATH is explicitly set OR if host is localhost
if (process.env.DB_SOCKET_PATH) {
    poolConfig.socketPath = process.env.DB_SOCKET_PATH;
} else if ((!process.env.DB_HOST || process.env.DB_HOST === 'localhost') && process.platform === 'darwin') {
    // Try common socket paths on macOS
    const commonSockets = [
        '/tmp/mysql.sock',
        '/var/run/mysqld/mysqld.sock',
        '/opt/homebrew/var/mysql/mysql.sock',
        '/usr/local/var/mysql/mysql.sock'
    ];
    
    for (const socket of commonSockets) {
        try {
            if (existsSync(socket)) {
                poolConfig.socketPath = socket;
                break;
            }
        } catch (e) {
            // Ignore errors
        }
    }
}

const pool = mysql.createPool(poolConfig);

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.message);
    });

export default pool;

