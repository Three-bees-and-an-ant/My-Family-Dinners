#!/bin/bash

# MySQL Installation Script for Mac

echo "📦 MySQL Installation Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Homebrew is installed
echo -e "${BLUE}📊 Step 1: Checking Homebrew...${NC}"

if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}⚠️  Homebrew not found. Installing Homebrew...${NC}"
    echo "This will take 5-10 minutes. Please wait..."
    echo ""
    
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH (for Apple Silicon Macs)
    if [ -f "/opt/homebrew/bin/brew" ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}❌ Homebrew installation failed${NC}"
        echo "Please install Homebrew manually:"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    echo -e "${GREEN}✅ Homebrew installed${NC}"
else
    echo -e "${GREEN}✅ Homebrew found: $(brew --version | head -1)${NC}"
fi

echo ""

# Check if MySQL is already installed
echo -e "${BLUE}📊 Step 2: Checking MySQL...${NC}"

if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version | awk '{print $5}' | cut -d',' -f1)
    echo -e "${GREEN}✅ MySQL already installed: $MYSQL_VERSION${NC}"
    echo ""
    echo "Skipping installation. Starting MySQL..."
    brew services start mysql 2>&1
    sleep 5
    
    if mysql -u root -e "SELECT 1;" 2>/dev/null; then
        echo -e "${GREEN}✅ MySQL is running${NC}"
    else
        echo -e "${YELLOW}⚠️  MySQL might need password setup${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MySQL not found. Installing MySQL...${NC}"
    echo "This will take 5-10 minutes. Please wait..."
    echo ""
    
    # Install MySQL
    brew install mysql
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ MySQL installation failed${NC}"
        echo "Please install MySQL manually:"
        echo "  brew install mysql"
        exit 1
    fi
    
    echo -e "${GREEN}✅ MySQL installed${NC}"
    echo ""
    
    # Start MySQL
    echo -e "${BLUE}📊 Step 3: Starting MySQL...${NC}"
    brew services start mysql
    echo "Waiting 10 seconds for MySQL to start..."
    sleep 10
    
    # Test connection
    if mysql -u root -e "SELECT 1;" 2>/dev/null; then
        echo -e "${GREEN}✅ MySQL is running${NC}"
    else
        echo -e "${YELLOW}⚠️  MySQL started but connection test failed${NC}"
        echo "This is normal for first-time setup. MySQL might need a moment to fully start."
        echo "Try running: mysql -u root -e \"SELECT 1;\" in a few seconds"
    fi
fi

echo ""
echo -e "${BLUE}📊 Step 4: Setting up database...${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if SQL file exists
if [ ! -f "family_meals_complete.sql" ]; then
    echo -e "${YELLOW}⚠️  family_meals_complete.sql not found${NC}"
    echo "Creating database manually..."
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS family_meals;" 2>/dev/null
    
    if [ -f "backend/scripts/seed.js" ]; then
        echo "Running seed script..."
        cd backend
        npm run seed
        cd ..
    fi
else
    echo "Importing database from family_meals_complete.sql..."
    
    if mysql -u root < family_meals_complete.sql 2>/dev/null; then
        echo -e "${GREEN}✅ Database imported successfully${NC}"
        
        # Run seed to ensure users are created with proper passwords
        if [ -f "backend/scripts/seed.js" ]; then
            echo "Running seed script for users..."
            cd backend
            npm run seed
            cd ..
        fi
    else
        echo -e "${YELLOW}⚠️  SQL import had issues, trying seed script...${NC}"
        mysql -u root -e "CREATE DATABASE IF NOT EXISTS family_meals;" 2>/dev/null
        cd backend
        npm run seed
        cd ..
    fi
fi

# Verify database
echo ""
echo -e "${BLUE}📊 Step 5: Verifying database...${NC}"

if mysql -u root -e "USE family_meals; SELECT COUNT(*) FROM menu_items;" 2>/dev/null > /dev/null; then
    MENU_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM menu_items;" 2>/dev/null | tail -1)
    USER_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM users;" 2>/dev/null | tail -1)
    
    echo -e "${GREEN}✅ Database verified!${NC}"
    echo -e "${GREEN}✅ Menu items: $MENU_COUNT${NC}"
    echo -e "${GREEN}✅ Users: $USER_COUNT${NC}"
else
    echo -e "${YELLOW}⚠️  Database verification failed${NC}"
    echo "You may need to run: cd backend && npm run seed"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ MySQL Installation Complete!${NC}"
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
