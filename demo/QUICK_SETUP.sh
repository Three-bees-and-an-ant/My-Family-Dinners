#!/bin/bash

# The Family Meals - Quick Setup Script
# This script sets up the project from scratch and starts it

echo "🍽️  The Family Meals - Quick Setup Starting..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Node.js check
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo "Please install Node.js first: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# MySQL check
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠️  MySQL not found!${NC}"
    echo "MySQL must be installed. Continuing..."
else
    echo -e "${GREEN}✅ MySQL found${NC}"
fi

# Backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# .env file check
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found, create manually${NC}"
    fi
fi

cd ..

# Frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi
cd ..

echo ""
echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start MySQL:"
echo "   brew services start mysql  # Mac"
echo "   or start MySQL manually"
echo ""
echo "2. Create database:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE IF NOT EXISTS family_meals;"
echo "   EXIT;"
echo ""
echo "3. Load schema:"
echo "   cd backend"
echo "   mysql -u root -p family_meals < database/schema.sql"
echo ""
echo "4. Load demo data:"
echo "   cd backend"
echo "   npm run seed"
echo ""
echo "5. Start the application:"
echo "   ./start.sh"
echo ""
echo "or manually:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo -e "${GREEN}🎉 You're ready!${NC}"
