import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authRateLimit } from '../middleware/security.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/register', authRateLimit, validateRegister, asyncHandler(registerUser));
router.post('/login', authRateLimit, validateLogin, asyncHandler(loginUser));

export default router;

