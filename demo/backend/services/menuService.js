import pool from '../database/connection.js';

/**
 * Get all menu items
 */
export const getAllMenuItems = async () => {
    try {
        const [items] = await pool.execute(
            'SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY category, name'
        );
        return items;
    } catch (error) {
        // Provide more helpful error messages
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            throw new Error('Cannot connect to MySQL database. Please ensure MySQL is running: brew services start mysql');
        }
        if (error.code === 'ER_BAD_DB_ERROR') {
            throw new Error('Database "family_meals" does not exist. Please run: cd backend && npm run seed');
        }
        if (error.code === 'ER_NO_SUCH_TABLE') {
            throw new Error('Table "menu_items" does not exist. Please run: cd backend && npm run seed');
        }
        throw error;
    }
};

/**
 * Get menu item by ID
 */
export const getMenuItemById = async (id) => {
    try {
        const [items] = await pool.execute(
            'SELECT * FROM menu_items WHERE id = ?',
            [id]
        );
        return items[0];
    } catch (error) {
        throw error;
    }
};

/**
 * Create menu item (staff/admin only)
 */
export const createMenuItem = async (name, price, serving_size, category, description = null, calories = null, protein_g = null, carbs_g = null, fat_g = null, fiber_g = null, weight_g = null, is_healthy = true, allergens = null, prep_time_minutes = null) => {
    try {
        const [result] = await pool.execute(
            `INSERT INTO menu_items 
            (name, price, serving_size, category, description, calories, protein_g, carbs_g, fat_g, fiber_g, weight_g, is_healthy, allergens, prep_time_minutes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, price, serving_size, category, description, calories, protein_g, carbs_g, fat_g, fiber_g, weight_g, is_healthy, allergens, prep_time_minutes]
        );
        return result.insertId;
    } catch (error) {
        throw error;
    }
};

/**
 * Update menu item (staff/admin only)
 */
export const updateMenuItem = async (id, updates) => {
    try {
        const fields = [];
        const values = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.price !== undefined) {
            fields.push('price = ?');
            values.push(updates.price);
        }
        if (updates.serving_size !== undefined) {
            fields.push('serving_size = ?');
            values.push(updates.serving_size);
        }
        if (updates.category !== undefined) {
            fields.push('category = ?');
            values.push(updates.category);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if (updates.is_available !== undefined) {
            fields.push('is_available = ?');
            values.push(updates.is_available);
        }
        if (updates.calories !== undefined) {
            fields.push('calories = ?');
            values.push(updates.calories);
        }
        if (updates.protein_g !== undefined) {
            fields.push('protein_g = ?');
            values.push(updates.protein_g);
        }
        if (updates.carbs_g !== undefined) {
            fields.push('carbs_g = ?');
            values.push(updates.carbs_g);
        }
        if (updates.fat_g !== undefined) {
            fields.push('fat_g = ?');
            values.push(updates.fat_g);
        }
        if (updates.fiber_g !== undefined) {
            fields.push('fiber_g = ?');
            values.push(updates.fiber_g);
        }
        if (updates.weight_g !== undefined) {
            fields.push('weight_g = ?');
            values.push(updates.weight_g);
        }
        if (updates.is_healthy !== undefined) {
            fields.push('is_healthy = ?');
            values.push(updates.is_healthy);
        }
        if (updates.allergens !== undefined) {
            fields.push('allergens = ?');
            values.push(updates.allergens);
        }
        if (updates.prep_time_minutes !== undefined) {
            fields.push('prep_time_minutes = ?');
            values.push(updates.prep_time_minutes);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(id);
        await pool.execute(
            `UPDATE menu_items SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await getMenuItemById(id);
    } catch (error) {
        throw error;
    }
};

/**
 * Delete menu item (staff/admin only)
 */
export const deleteMenuItem = async (id) => {
    try {
        await pool.execute('DELETE FROM menu_items WHERE id = ?', [id]);
        return true;
    } catch (error) {
        throw error;
    }
};

