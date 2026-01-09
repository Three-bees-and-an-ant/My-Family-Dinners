import { register, login } from '../services/authService.js';
import { consoleLog } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Only allow 'user' role for registration (staff/admin created by admin)
    const userRole = role === 'staff' || role === 'admin' ? 'user' : (role || 'user');

    const result = await register(name, email, password, userRole);
    consoleLog(`New user registered: ${email}`, 'success');

    res.status(201).json({
        success: true,
        ...result
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await login(email, password);
    consoleLog(`User logged in: ${email}`, 'success');

    res.json({
        success: true,
        ...result
    });
});

