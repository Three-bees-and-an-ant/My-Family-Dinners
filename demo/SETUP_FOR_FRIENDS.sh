#!/bin/bash

# Complete Setup Script for Friends
# This script sets up everything automatically

echo "🍽️ The Family Meals - Complete Setup"
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

# Step 1: Check Node.js
echo -e "${BLUE}📊 Step 1: Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo "Please install Node.js: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# Step 2: Check MySQL
echo ""
echo -e "${BLUE}📊 Step 2: Checking MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL not found!${NC}"
    echo "Please install MySQL:"
    echo "  Mac: brew install mysql"
    echo "  Windows: Download from mysql.com"
    exit 1
fi
echo -e "${GREEN}✅ MySQL found${NC}"

# Step 3: Start MySQL
echo ""
echo -e "${BLUE}📊 Step 3: Starting MySQL...${NC}"
if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL is already running${NC}"
else
    if command -v brew &> /dev/null; then
        echo "Starting MySQL..."
        brew services start mysql 2>&1
        sleep 5
        if mysql -u root -e "SELECT 1;" 2>/dev/null; then
            echo -e "${GREEN}✅ MySQL started${NC}"
        else
            echo -e "${YELLOW}⚠️  MySQL might need manual start${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Please start MySQL manually${NC}"
    fi
fi

# Step 4: Install Dependencies
echo ""
echo -e "${BLUE}📊 Step 4: Installing dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 5: Setup Database
echo ""
echo -e "${BLUE}📊 Step 5: Setting up database...${NC}"

# Create .env if doesn't exist
cd backend
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=family_meals
DB_PORT=3306
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
fi
cd ..

# Check if complete SQL file exists
if [ -f "family_meals_complete.sql" ]; then
    echo "Found complete SQL file, importing..."
    mysql -u root < family_meals_complete.sql 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database structure and menu items imported from SQL file${NC}"
        echo "Running seed script to create users and additional data..."
        cd backend
        npm run seed
        cd ..
    else
        echo -e "${YELLOW}⚠️  SQL import failed, trying seed script only...${NC}"
        cd backend
        npm run seed
        cd ..
    fi
else
    echo "SQL file not found, using seed script only..."
    cd backend
    npm run seed
    cd ..
fi

# Verify database
if mysql -u root -e "USE family_meals; SELECT COUNT(*) FROM menu_items;" 2>/dev/null > /dev/null; then
    MENU_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM menu_items;" 2>/dev/null | tail -1)
    echo -e "${GREEN}✅ Database ready with $MENU_COUNT menu items${NC}"
else
    echo -e "${RED}❌ Database setup failed${NC}"
    exit 1
fi

# Step 6: Final Instructions
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open Browser:"
echo "   http://localhost:5173"
echo ""
echo "🔑 Login Credentials:"
echo "   User:  user@demo.com / password123"
echo "   Staff: staff@demo.com / password123"
echo "   Admin: admin@demo.com / password123"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
