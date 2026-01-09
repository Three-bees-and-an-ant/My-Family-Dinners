#!/bin/bash

# MySQL Start and Setup Script

echo "🔧 MySQL Setup Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL is not installed!${NC}"
    echo ""
    echo "Installing MySQL..."
    brew install mysql
    echo ""
fi

echo -e "${BLUE}📊 Step 1: Starting MySQL...${NC}"

# Try to start MySQL via brew services
if command -v brew &> /dev/null; then
    echo "Attempting to start MySQL via Homebrew..."
    brew services start mysql 2>&1
    
    # Wait a bit for MySQL to start
    echo "Waiting 5 seconds for MySQL to start..."
    sleep 5
else
    echo -e "${YELLOW}⚠️  Homebrew not found. Trying manual start...${NC}"
    # Try manual start
    if [ -f "/usr/local/mysql/support-files/mysql.server" ]; then
        sudo /usr/local/mysql/support-files/mysql.server start
    elif [ -f "/opt/homebrew/opt/mysql/support-files/mysql.server" ]; then
        /opt/homebrew/opt/mysql/support-files/mysql.server start
    else
        echo -e "${RED}❌ Could not find MySQL server script${NC}"
        echo "Please start MySQL manually"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📊 Step 2: Testing MySQL connection...${NC}"

# Test connection
if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL is running!${NC}"
else
    echo -e "${RED}❌ MySQL connection failed${NC}"
    echo ""
    echo "Trying alternative connection methods..."
    
    # Try with socket
    if mysql -u root --socket=/tmp/mysql.sock -e "SELECT 1;" 2>/dev/null; then
        echo -e "${GREEN}✅ MySQL is running (via socket)${NC}"
    else
        echo -e "${YELLOW}⚠️  MySQL might need a password${NC}"
        echo "Please run manually:"
        echo "  mysql -u root -p"
        echo ""
        echo "Or set password in backend/.env file:"
        echo "  DB_PASSWORD=your_password"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📊 Step 3: Checking database...${NC}"

# Check if database exists
if mysql -u root -e "USE family_meals;" 2>/dev/null; then
    echo -e "${GREEN}✅ Database 'family_meals' exists${NC}"
    
    # Check table count
    TABLE_COUNT=$(mysql -u root -e "USE family_meals; SHOW TABLES;" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$TABLE_COUNT" -gt 1 ]; then
        echo -e "${GREEN}✅ Found $((TABLE_COUNT - 1)) tables${NC}"
        
        # Check menu items
        MENU_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM menu_items;" 2>/dev/null | tail -1)
        if [ "$MENU_COUNT" -gt 0 ]; then
            echo -e "${GREEN}✅ Found $MENU_COUNT menu items${NC}"
        else
            echo -e "${YELLOW}⚠️  Database is empty. Seeding...${NC}"
            cd backend
            npm run seed
            cd ..
        fi
    else
        echo -e "${YELLOW}⚠️  Database exists but has no tables. Seeding...${NC}"
        cd backend
        npm run seed
        cd ..
    fi
else
    echo -e "${YELLOW}⚠️  Database 'family_meals' does not exist${NC}"
    echo "Creating database and seeding..."
    cd backend
    npm run seed
    cd ..
fi

echo ""
echo -e "${BLUE}📊 Step 4: Final verification...${NC}"

# Final test
if mysql -u root -e "USE family_meals; SELECT COUNT(*) FROM menu_items;" 2>/dev/null > /dev/null; then
    MENU_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM menu_items;" 2>/dev/null | tail -1)
    USER_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM users;" 2>/dev/null | tail -1)
    
    echo -e "${GREEN}✅ MySQL is ready!${NC}"
    echo -e "${GREEN}✅ Database: family_meals${NC}"
    echo -e "${GREEN}✅ Menu items: $MENU_COUNT${NC}"
    echo -e "${GREEN}✅ Users: $USER_COUNT${NC}"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ MySQL Setup Complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start backend: cd backend && npm run dev"
    echo "2. Start frontend: cd frontend && npm run dev"
    echo "3. Open browser: http://localhost:5173"
else
    echo -e "${RED}❌ Database verification failed${NC}"
    echo "Please check the error messages above"
    exit 1
fi
