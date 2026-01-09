import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import schedulingRoutes from './routes/schedulingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { checkAndSendReminders, checkPendingOrdersTimeout } from './services/notificationService.js';
import { consoleLog } from './utils/logger.js';
import { securityHeaders, apiRateLimit } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import config from './utils/config.js';

dotenv.config();

const app = express();
const PORT = config.port;

// Security middleware
app.use(securityHeaders);

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', apiRateLimit);

// Request logging middleware
app.use((req, res, next) => {
    consoleLog(`${req.method} ${req.path}`, 'info');
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    consoleLog(`🚀 Server running on http://0.0.0.0:${PORT}`, 'success');
    consoleLog(`📝 API Documentation: http://localhost:${PORT}/api/health`, 'info');
    consoleLog(`🌍 Environment: ${config.nodeEnv}`, 'info');
});

// Simulate notification checks (run every 2 minutes for demo)
// In production, this would be a proper cron job
setInterval(async () => {
    try {
        await checkAndSendReminders();
        await checkPendingOrdersTimeout();
    } catch (error) {
        console.error('Error in notification checks:', error);
    }
}, 2 * 60 * 1000); // 2 minutes

