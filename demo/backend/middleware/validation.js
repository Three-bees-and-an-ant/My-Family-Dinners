import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation middleware - checks validation results
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

/**
 * User registration validation
 */
export const validateRegister = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    validate
];

/**
 * User login validation
 */
export const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validate
];

/**
 * Menu item validation
 */
export const validateMenuItem = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Name must be between 2 and 255 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('serving_size')
        .trim()
        .notEmpty()
        .withMessage('Serving size is required'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must be less than 100 characters'),
    body('calories')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Calories must be a non-negative integer'),
    body('protein_g')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Protein must be a non-negative number'),
    validate
];

/**
 * Order validation
 */
export const validateOrder = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Items array is required and must not be empty'),
    body('items.*.menu_item_id')
        .isInt({ min: 1 })
        .withMessage('Each item must have a valid menu_item_id'),
    body('items.*.quantity')
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantity must be between 1 and 100'),
    body('scheduled_date')
        .isISO8601()
        .withMessage('Scheduled date must be a valid ISO 8601 date'),
    validate
];

/**
 * ID parameter validation
 */
export const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer'),
    validate
];




