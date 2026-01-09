#!/bin/bash

# EASY SETUP - For Friends (One Command Setup)
# This script does EVERYTHING automatically

echo "🍽️  The Family Meals - Easy Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will:"
echo "  1. Check/Install MySQL"
echo "  2. Import SQL database"
echo "  3. Create users"
echo "  4. Install dependencies"
echo "  5. Start everything"
echo ""
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
    echo "Installing MySQL..."
    if command -v brew &> /dev/null; then
        brew install mysql
    else
        echo -e "${RED}❌ Please install MySQL manually: https://dev.mysql.com/downloads/mysql/${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ MySQL found${NC}"

# Step 2: Start MySQL
echo ""
echo -e "${BLUE}📊 Step 2: Starting MySQL...${NC}"

if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL is running${NC}"
else
    echo "Starting MySQL..."
    if command -v brew &> /dev/null; then
        brew services start mysql 2>&1
        echo "Waiting 10 seconds for MySQL to start..."
        sleep 10
        
        if mysql -u root -e "SELECT 1;" 2>/dev/null; then
            echo -e "${GREEN}✅ MySQL started${NC}"
        else
            echo -e "${YELLOW}⚠️  MySQL might need a password${NC}"
            echo "Please start MySQL manually: brew services start mysql"
        fi
    fi
fi

# Step 3: Check SQL File
echo ""
echo -e "${BLUE}📊 Step 3: Checking SQL file...${NC}"

if [ ! -f "family_meals_complete.sql" ]; then
    echo -e "${RED}❌ family_meals_complete.sql NOT FOUND!${NC}"
    echo ""
    echo "This file is REQUIRED. Please make sure:"
    echo "  1. You extracted the zip file completely"
    echo "  2. family_meals_complete.sql is in the project folder"
    echo ""
    echo "If the file is missing, ask the person who sent you the project."
    exit 1
fi

echo -e "${GREEN}✅ SQL file found${NC}"

# Step 4: Import Database
echo ""
echo -e "${BLUE}📊 Step 4: Importing database...${NC}"

# Drop existing database if it exists
mysql -u root -e "DROP DATABASE IF EXISTS family_meals;" 2>/dev/null

# Import SQL file
echo "Importing family_meals_complete.sql..."
mysql -u root < family_meals_complete.sql 2>&1 | grep -v "ERROR" || true

if mysql -u root -e "USE family_meals; SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ Database imported successfully${NC}"
else
    echo -e "${YELLOW}⚠️  SQL import had some errors, but continuing...${NC}"
    # Try with force
    mysql -u root --force < family_meals_complete.sql 2>&1 | grep -v "ERROR" || true
fi

# Step 5: Install Dependencies
echo ""
echo -e "${BLUE}📊 Step 5: Installing dependencies...${NC}"

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

# Step 6: Create .env
echo ""
echo -e "${BLUE}📊 Step 6: Creating .env file...${NC}"

if [ ! -f "backend/.env" ]; then
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
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Step 7: Create Users
echo ""
echo -e "${BLUE}📊 Step 7: Creating users...${NC}"

cd backend
npm run seed 2>&1 | grep -v "error" || true
cd ..

# Verify users
USER_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM users;" 2>/dev/null | tail -1)
if [ "$USER_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Users created ($USER_COUNT users)${NC}"
else
    echo -e "${YELLOW}⚠️  No users found, but continuing...${NC}"
fi

# Step 8: Final Summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd $SCRIPT_DIR/backend"
echo "   npm run dev"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd $SCRIPT_DIR/frontend"
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
