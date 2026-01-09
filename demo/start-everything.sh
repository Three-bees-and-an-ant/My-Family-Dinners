#!/bin/bash

# Complete Application Startup Script
# This script starts MySQL, Backend, and Frontend

echo "🚀 Starting Complete Application"
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

# Step 1: Start MySQL
echo -e "${BLUE}📊 Step 1: Starting MySQL...${NC}"

if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL is already running${NC}"
else
    echo "Starting MySQL..."
    if command -v brew &> /dev/null; then
        brew services start mysql 2>&1
        echo "Waiting 5 seconds for MySQL to start..."
        sleep 5
        
        # Test connection
        if mysql -u root -e "SELECT 1;" 2>/dev/null; then
            echo -e "${GREEN}✅ MySQL started successfully${NC}"
        else
            echo -e "${YELLOW}⚠️  MySQL might need password setup${NC}"
            echo "Run: ./setup-mysql-no-password.sh"
            echo ""
        fi
    else
        echo -e "${RED}❌ Homebrew not found${NC}"
        exit 1
    fi
fi

# Step 2: Check/Create Database
echo ""
echo -e "${BLUE}📊 Step 2: Checking database...${NC}"

if mysql -u root -e "USE family_meals;" 2>/dev/null; then
    echo -e "${GREEN}✅ Database 'family_meals' exists${NC}"
    
    # Check if tables exist
    TABLE_COUNT=$(mysql -u root -e "USE family_meals; SHOW TABLES;" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$TABLE_COUNT" -le 1 ]; then
        echo -e "${YELLOW}⚠️  Database is empty. Seeding...${NC}"
        cd backend
        npm run seed
        cd ..
    else
        MENU_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM menu_items;" 2>/dev/null | tail -1)
        if [ "$MENU_COUNT" -eq 0 ]; then
            echo -e "${YELLOW}⚠️  No menu items. Seeding...${NC}"
            cd backend
            npm run seed
            cd ..
        else
            echo -e "${GREEN}✅ Database has $MENU_COUNT menu items${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Database does not exist. Creating and seeding...${NC}"
    cd backend
    npm run seed
    cd ..
fi

# Step 3: Start Backend
echo ""
echo -e "${BLUE}📊 Step 3: Starting Backend...${NC}"

# Check if backend is already running
if curl -s http://localhost:3000/api/health &>/dev/null; then
    echo -e "${GREEN}✅ Backend is already running${NC}"
else
    echo "Starting backend server..."
    cd backend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing backend dependencies..."
        npm install
    fi
    
    # Start backend in background
    echo "Starting backend on port 3000..."
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    # Wait for backend to start
    echo "Waiting for backend to start..."
    for i in {1..10}; do
        sleep 1
        if curl -s http://localhost:3000/api/health &>/dev/null; then
            echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
            break
        fi
        if [ $i -eq 10 ]; then
            echo -e "${YELLOW}⚠️  Backend might still be starting. Check backend.log${NC}"
        fi
    done
    
    cd ..
fi

# Step 4: Start Frontend
echo ""
echo -e "${BLUE}📊 Step 4: Starting Frontend...${NC}"

# Check if frontend is already running
if curl -s http://localhost:5173 &>/dev/null; then
    echo -e "${GREEN}✅ Frontend is already running${NC}"
else
    echo "Starting frontend server..."
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi
    
    # Start frontend in background
    echo "Starting frontend on port 5173..."
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    # Wait for frontend to start
    echo "Waiting for frontend to start..."
    sleep 3
    if curl -s http://localhost:5173 &>/dev/null; then
        echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend might still be starting. Check frontend.log${NC}"
    fi
    
    cd ..
fi

# Final Status
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Application Startup Complete!${NC}"
echo ""
echo "📋 Status:"
echo "  MySQL: $(mysql -u root -e 'SELECT 1;' 2>/dev/null && echo '✅ Running' || echo '❌ Not running')"
echo "  Backend: $(curl -s http://localhost:3000/api/health &>/dev/null && echo '✅ Running on http://localhost:3000' || echo '❌ Not running')"
echo "  Frontend: $(curl -s http://localhost:5173 &>/dev/null && echo '✅ Running on http://localhost:5173' || echo '❌ Not running')"
echo ""
echo "🌐 Open in browser:"
echo "  http://localhost:5173"
echo ""
echo "📝 Logs:"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop:"
echo "  ./stop-everything.sh"
echo "  Or: kill \$(cat backend.pid frontend.pid 2>/dev/null)"
echo ""
