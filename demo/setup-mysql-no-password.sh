#!/bin/bash

# MySQL Setup - No Password Configuration
# This script sets up MySQL to work without password for root user

echo "🔧 MySQL Setup - No Password Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Start MySQL
echo -e "${BLUE}📊 Step 1: Starting MySQL...${NC}"

if command -v brew &> /dev/null; then
    echo "Starting MySQL via Homebrew..."
    brew services start mysql 2>&1
    sleep 5
else
    echo -e "${RED}❌ Homebrew not found${NC}"
    exit 1
fi

# Step 2: Try to connect without password
echo ""
echo -e "${BLUE}📊 Step 2: Testing connection...${NC}"

if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL is running and accessible without password!${NC}"
    NO_PASSWORD=true
else
    echo -e "${YELLOW}⚠️  MySQL requires password or is not running${NC}"
    NO_PASSWORD=false
    
    # Try to stop MySQL to reset password
    echo ""
    echo -e "${BLUE}📊 Step 3: Attempting to reset MySQL password...${NC}"
    echo "This will stop MySQL temporarily..."
    
    brew services stop mysql
    sleep 2
    
    # Start MySQL in safe mode (skip grant tables)
    echo "Starting MySQL in safe mode..."
    mysqld_safe --skip-grant-tables &
    SAFE_PID=$!
    sleep 5
    
    # Try to connect and remove password
    if mysql -u root -e "USE mysql; UPDATE user SET authentication_string='' WHERE User='root'; FLUSH PRIVILEGES;" 2>/dev/null; then
        echo -e "${GREEN}✅ Password removed successfully${NC}"
        kill $SAFE_PID 2>/dev/null
        sleep 2
        brew services start mysql
        sleep 5
        
        if mysql -u root -e "SELECT 1;" 2>/dev/null; then
            NO_PASSWORD=true
            echo -e "${GREEN}✅ MySQL now works without password!${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Could not reset password automatically${NC}"
        kill $SAFE_PID 2>/dev/null
    fi
fi

# Step 3: Create/Update .env file
echo ""
echo -e "${BLUE}📊 Step 3: Configuring backend/.env...${NC}"

ENV_FILE="backend/.env"

# Create .env if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file..."
    cat > "$ENV_FILE" << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=family_meals
DB_PORT=3306

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# Server Configuration
PORT=3000
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ Created .env file${NC}"
else
    echo "Updating .env file..."
    # Update DB_PASSWORD to empty if it exists
    if grep -q "DB_PASSWORD" "$ENV_FILE"; then
        sed -i '' 's/^DB_PASSWORD=.*/DB_PASSWORD=/' "$ENV_FILE"
        echo -e "${GREEN}✅ Updated DB_PASSWORD to empty${NC}"
    else
        # Add DB_PASSWORD if it doesn't exist
        if ! grep -q "DB_PASSWORD" "$ENV_FILE"; then
            echo "DB_PASSWORD=" >> "$ENV_FILE"
            echo -e "${GREEN}✅ Added DB_PASSWORD to .env${NC}"
        fi
    fi
fi

# Step 4: Test connection with new config
echo ""
echo -e "${BLUE}📊 Step 4: Testing database connection...${NC}"

if [ "$NO_PASSWORD" = true ]; then
    # Create database if it doesn't exist
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS family_meals;" 2>/dev/null
    
    if mysql -u root -e "USE family_meals;" 2>/dev/null; then
        echo -e "${GREEN}✅ Database 'family_meals' is accessible${NC}"
        
        # Check if tables exist
        TABLE_COUNT=$(mysql -u root -e "USE family_meals; SHOW TABLES;" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$TABLE_COUNT" -gt 1 ]; then
            echo -e "${GREEN}✅ Found $((TABLE_COUNT - 1)) tables${NC}"
            
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
            echo -e "${YELLOW}⚠️  No tables found. Seeding database...${NC}"
            cd backend
            npm run seed
            cd ..
        fi
    else
        echo -e "${RED}❌ Could not access database${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MySQL still requires password${NC}"
    echo ""
    echo "Manual steps:"
    echo "1. Run: mysql -u root -p"
    echo "2. Enter your MySQL password"
    echo "3. Run: ALTER USER 'root'@'localhost' IDENTIFIED BY '';"
    echo "4. Run: FLUSH PRIVILEGES;"
    echo "5. Exit MySQL"
    echo "6. Update backend/.env: DB_PASSWORD=your_password"
    exit 1
fi

# Final verification
echo ""
echo -e "${BLUE}📊 Step 5: Final verification...${NC}"

if mysql -u root -e "USE family_meals; SELECT COUNT(*) FROM menu_items;" 2>/dev/null > /dev/null; then
    MENU_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM menu_items;" 2>/dev/null | tail -1)
    USER_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM users;" 2>/dev/null | tail -1)
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ MySQL Setup Complete!${NC}"
    echo ""
    echo -e "${GREEN}✅ MySQL is running without password${NC}"
    echo -e "${GREEN}✅ Database: family_meals${NC}"
    echo -e "${GREEN}✅ Menu items: $MENU_COUNT${NC}"
    echo -e "${GREEN}✅ Users: $USER_COUNT${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start backend: cd backend && npm run dev"
    echo "2. Start frontend: cd frontend && npm run dev"
    echo "3. Open browser: http://localhost:5173"
    echo ""
else
    echo -e "${RED}❌ Setup incomplete. Please check errors above.${NC}"
    exit 1
fi
