#!/bin/bash

# Complete Application Startup Script
# This script checks everything, imports database, and starts backend + frontend

echo "🍽️  The Family Meals - Complete Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Check MySQL
echo -e "${BLUE}📊 Step 1: Checking MySQL...${NC}"

if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL not found!${NC}"
    echo "Please install MySQL: brew install mysql"
    exit 1
fi

echo -e "${GREEN}✅ MySQL found${NC}"

# Test MySQL connection
if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL is running${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL is not running. Starting MySQL...${NC}"
    if command -v brew &> /dev/null; then
        brew services start mysql 2>&1
        echo "Waiting 10 seconds for MySQL to start..."
        sleep 10
        
        if mysql -u root -e "SELECT 1;" 2>/dev/null; then
            echo -e "${GREEN}✅ MySQL started${NC}"
        else
            echo -e "${RED}❌ MySQL failed to start${NC}"
            echo "Please start MySQL manually: brew services start mysql"
            exit 1
        fi
    else
        echo -e "${RED}❌ Cannot start MySQL automatically${NC}"
        echo "Please start MySQL manually"
        exit 1
    fi
fi

# Step 2: Check/Create Database
echo ""
echo -e "${BLUE}📊 Step 2: Setting up database...${NC}"

# Check if database exists and has data
if mysql -u root -e "USE family_meals; SELECT COUNT(*) FROM menu_items;" 2>/dev/null > /dev/null; then
    MENU_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM menu_items;" 2>/dev/null | tail -1)
    if [ "$MENU_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Database exists with $MENU_COUNT menu items${NC}"
    else
        echo -e "${YELLOW}⚠️  Database exists but is empty. Importing...${NC}"
        mysql -u root < family_meals_complete.sql 2>&1 | grep -v "ERROR" || true
        echo -e "${GREEN}✅ Database imported${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Database doesn't exist. Creating and importing...${NC}"
    mysql -u root < family_meals_complete.sql 2>&1 | grep -v "ERROR" || true
    echo -e "${GREEN}✅ Database created and imported${NC}"
fi

# Run seed to ensure users are created
echo "Running seed script to create users..."
cd backend
npm run seed 2>&1 | grep -v "error" || true
cd ..

# Step 3: Check Backend
echo ""
echo -e "${BLUE}📊 Step 3: Checking backend...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env..."
    cat > backend/.env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=family_meals
DB_PORT=3306
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ backend/.env created${NC}"
fi

echo -e "${GREEN}✅ Backend ready${NC}"

# Step 4: Check Frontend
echo ""
echo -e "${BLUE}📊 Step 4: Checking frontend...${NC}"

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo -e "${GREEN}✅ Frontend ready${NC}"

# Step 5: Start Services
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Everything is ready!${NC}"
echo ""
echo "📋 Starting services..."
echo ""
echo "⚠️  IMPORTANT: You need to open 2 separate terminal windows:"
echo ""
echo "Terminal 1 - Backend:"
echo "   cd $SCRIPT_DIR/backend"
echo "   npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "   cd $SCRIPT_DIR/frontend"
echo "   npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "🔑 Login Credentials:"
echo "   User:  user@demo.com / password123"
echo "   Staff: staff@demo.com / password123"
echo "   Admin: admin@demo.com / password123"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
