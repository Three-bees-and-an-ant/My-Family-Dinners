import * as menuService from '../services/menuService.js';
import { consoleLog } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getAllMenuItems = asyncHandler(async (req, res) => {
    const items = await menuService.getAllMenuItems();
    res.json({
        success: true,
        data: items,
        count: items.length
    });
});

export const getMenuItem = asyncHandler(async (req, res) => {
    const item = await menuService.getMenuItemById(req.params.id);
    if (!item) {
        return res.status(404).json({ 
            success: false,
            error: 'Menu item not found' 
        });
    }
    res.json({
        success: true,
        data: item
    });
});

export const createMenuItem = asyncHandler(async (req, res) => {
    const { name, price, serving_size, category, description, calories, protein_g, carbs_g, fat_g, fiber_g, weight_g, is_healthy, allergens, prep_time_minutes } = req.body;

    const id = await menuService.createMenuItem(
        name, price, serving_size, category, description,
        calories, protein_g, carbs_g, fat_g, fiber_g, weight_g, is_healthy, allergens, prep_time_minutes
    );
    consoleLog(`Menu item created: ${name}`, 'success');
    res.status(201).json({ 
        success: true,
        id, 
        message: 'Menu item created successfully' 
    });
});

export const updateMenuItem = asyncHandler(async (req, res) => {
    const item = await menuService.updateMenuItem(req.params.id, req.body);
    consoleLog(`Menu item updated: ${req.params.id}`, 'success');
    res.json({
        success: true,
        data: item
    });
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
    await menuService.deleteMenuItem(req.params.id);
    consoleLog(`Menu item deleted: ${req.params.id}`, 'success');
    res.json({ 
        success: true,
        message: 'Menu item deleted successfully' 
    });
});

