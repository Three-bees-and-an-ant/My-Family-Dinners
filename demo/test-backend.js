#!/usr/bin/env node

/**
 * Backend Connection Test Script
 * Tests if backend and database are properly configured
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'backend', '.env') });

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabase() {
    log('\n📊 Testing Database Connection...', 'blue');
    
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'family_meals',
        port: process.env.DB_PORT || 3306
    };

    if (process.env.DB_SOCKET_PATH) {
        config.socketPath = process.env.DB_SOCKET_PATH;
    }

    try {
        const connection = await mysql.createConnection(config);
        log('✅ Database connection successful!', 'green');
        
        // Test if database exists
        const [databases] = await connection.execute('SHOW DATABASES LIKE ?', [config.database]);
        if (databases.length === 0) {
            log(`❌ Database '${config.database}' does not exist`, 'red');
            log('   Run: cd backend && npm run seed', 'yellow');
            await connection.end();
            return false;
        }
        log(`✅ Database '${config.database}' exists`, 'green');
        
        // Test if users table exists
        const [tables] = await connection.execute('SHOW TABLES LIKE ?', ['users']);
        if (tables.length === 0) {
            log('❌ Table "users" does not exist', 'red');
            log('   Run: cd backend && npm run seed', 'yellow');
            await connection.end();
            return false;
        }
        log('✅ Table "users" exists', 'green');
        
        // Test if menu_items table exists
        const [menuTables] = await connection.execute('SHOW TABLES LIKE ?', ['menu_items']);
        if (menuTables.length === 0) {
            log('❌ Table "menu_items" does not exist', 'red');
            log('   Run: cd backend && npm run seed', 'yellow');
            await connection.end();
            return false;
        }
        log('✅ Table "menu_items" exists', 'green');
        
        // Check if there are users
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        log(`✅ Found ${users[0].count} users in database`, 'green');
        
        // Check if there are menu items
        const [menuItems] = await connection.execute('SELECT COUNT(*) as count FROM menu_items');
        log(`✅ Found ${menuItems[0].count} menu items in database`, 'green');
        
        await connection.end();
        return true;
    } catch (error) {
        log(`❌ Database connection failed: ${error.message}`, 'red');
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            log('\n💡 Solution:', 'yellow');
            log('   1. Start MySQL: brew services start mysql', 'yellow');
            log('   2. Wait 5 seconds', 'yellow');
            log('   3. Run this test again', 'yellow');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            log('\n💡 Solution:', 'yellow');
            log('   Check your .env file in backend/.env', 'yellow');
            log('   Make sure DB_USER and DB_PASSWORD are correct', 'yellow');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            log('\n💡 Solution:', 'yellow');
            log('   Run: cd backend && npm run seed', 'yellow');
        }
        
        return false;
    }
}

async function testBackend() {
    log('\n📊 Testing Backend Server...', 'blue');
    
    try {
        const response = await fetch('http://localhost:3000/api/health');
        if (response.ok) {
            const data = await response.json();
            log('✅ Backend server is running!', 'green');
            log(`   Status: ${data.status}`, 'green');
            return true;
        } else {
            log(`❌ Backend returned status ${response.status}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Backend server is NOT running: ${error.message}`, 'red');
        log('\n💡 Solution:', 'yellow');
        log('   1. Open a terminal', 'yellow');
        log('   2. Run: cd backend && npm run dev', 'yellow');
        log('   3. Keep that terminal open', 'yellow');
        return false;
    }
}

async function main() {
    log('\n🔍 Backend & Database Diagnostic Test', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    
    const dbOk = await testDatabase();
    const backendOk = await testBackend();
    
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('\n📋 Summary:', 'blue');
    
    if (dbOk && backendOk) {
        log('✅ Everything is working!', 'green');
        log('   You should be able to login and view the menu.', 'green');
    } else {
        log('❌ Issues found:', 'red');
        if (!dbOk) {
            log('   - Database connection failed', 'red');
        }
        if (!backendOk) {
            log('   - Backend server is not running', 'red');
        }
        log('\n💡 Quick Fix:', 'yellow');
        log('   1. Start MySQL: brew services start mysql', 'yellow');
        log('   2. Start Backend: cd backend && npm run dev', 'yellow');
        log('   3. Seed Database: cd backend && npm run seed', 'yellow');
    }
    
    log('\n', 'reset');
}

main().catch(console.error);
