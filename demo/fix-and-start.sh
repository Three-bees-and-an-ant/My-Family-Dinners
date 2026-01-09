#!/bin/bash

# Quick Fix and Start Script for Menu Issue

echo "🔧 Fixing Menu Loading Issue..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check MySQL
echo "📊 Step 1: Checking MySQL..."
if command -v mysql &> /dev/null; then
    if mysql -u root -e "SELECT 1;" 2>/dev/null; then
        echo -e "${GREEN}✅ MySQL is running${NC}"
    else
        echo -e "${YELLOW}⚠️  MySQL is not running. Attempting to start...${NC}"
        if command -v brew &> /dev/null; then
            brew services start mysql 2>/dev/null || echo -e "${RED}❌ Could not start MySQL via brew${NC}"
        else
            echo -e "${YELLOW}⚠️  Please start MySQL manually${NC}"
        fi
        sleep 2
    fi
else
    echo -e "${RED}❌ MySQL not found. Please install MySQL first.${NC}"
    echo "   Run: brew install mysql"
    exit 1
fi

# Step 2: Check if database exists
echo ""
echo "📊 Step 2: Checking database..."
if mysql -u root -e "USE family_meals;" 2>/dev/null; then
    echo -e "${GREEN}✅ Database 'family_meals' exists${NC}"
    
    # Check if menu_items table has data
    COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM menu_items;" 2>/dev/null | tail -1)
    if [ "$COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Database has $COUNT menu items${NC}"
    else
        echo -e "${YELLOW}⚠️  Database is empty. Seeding...${NC}"
        cd backend
        npm run seed
        cd ..
    fi
else
    echo -e "${YELLOW}⚠️  Database 'family_meals' does not exist. Creating...${NC}"
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS family_meals;" 2>/dev/null
    echo -e "${YELLOW}⚠️  Please run: cd backend && npm run seed${NC}"
fi

# Step 3: Check backend .env
echo ""
echo "📊 Step 3: Checking backend configuration..."
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env file missing. Creating from example...${NC}"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✅ .env file created. Please edit it if needed.${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
fi

# Step 4: Check if ports are free
echo ""
echo "📊 Step 4: Checking ports..."
if lsof -i :3000 &>/dev/null; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use${NC}"
    echo "   Backend might already be running"
else
    echo -e "${GREEN}✅ Port 3000 is free${NC}"
fi

if lsof -i :5173 &>/dev/null; then
    echo -e "${YELLOW}⚠️  Port 5173 is in use${NC}"
    echo "   Frontend might already be running"
else
    echo -e "${GREEN}✅ Port 5173 is free${NC}"
fi

# Step 5: Start services
echo ""
echo "📊 Step 5: Starting services..."
echo ""

# Check if backend is already running
if curl -s http://localhost:3000/api/health &>/dev/null; then
    echo -e "${GREEN}✅ Backend is already running${NC}"
else
    echo -e "${YELLOW}⚠️  Backend is not running${NC}"
    echo "   Please start it manually:"
    echo "   cd backend && npm run dev"
    echo ""
fi

# Check if frontend is already running
if curl -s http://localhost:5173 &>/dev/null; then
    echo -e "${GREEN}✅ Frontend is already running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend is not running${NC}"
    echo "   Please start it manually:"
    echo "   cd frontend && npm run dev"
    echo ""
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To fix the menu issue, make sure:"
echo ""
echo "1. ✅ MySQL is running"
echo "2. ✅ Database 'family_meals' exists and is seeded"
echo "3. ✅ Backend is running on port 3000"
echo "4. ✅ Frontend is running on port 5173"
echo ""
echo "Quick start commands:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "  Terminal 3 (Seed if needed):"
echo "    cd backend && npm run seed"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
