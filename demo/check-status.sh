#!/bin/bash

# Quick Status Check Script

echo "🔍 Application Status Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check MySQL
echo -e "${BLUE}📊 MySQL:${NC}"
if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ Running${NC}"
    
    if mysql -u root -e "USE family_meals;" 2>/dev/null; then
        MENU_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM menu_items;" 2>/dev/null | tail -1)
        USER_COUNT=$(mysql -u root -e "USE family_meals; SELECT COUNT(*) as count FROM users;" 2>/dev/null | tail -1)
        echo -e "   Database: ${GREEN}✅ family_meals${NC}"
        echo -e "   Menu items: ${GREEN}$MENU_COUNT${NC}"
        echo -e "   Users: ${GREEN}$USER_COUNT${NC}"
    else
        echo -e "   Database: ${RED}❌ Not found${NC}"
    fi
else
    echo -e "${RED}❌ Not running${NC}"
    echo "   Run: brew services start mysql"
fi

echo ""

# Check Backend
echo -e "${BLUE}📊 Backend:${NC}"
if curl -s http://localhost:3000/api/health &>/dev/null; then
    echo -e "${GREEN}✅ Running on http://localhost:3000${NC}"
    
    # Test menu endpoint
    if curl -s http://localhost:3000/api/menu | grep -q "success"; then
        echo -e "   API: ${GREEN}✅ Responding${NC}"
    else
        echo -e "   API: ${YELLOW}⚠️  Error${NC}"
    fi
else
    echo -e "${RED}❌ Not running${NC}"
    echo "   Run: cd backend && npm run dev"
fi

echo ""

# Check Frontend
echo -e "${BLUE}📊 Frontend:${NC}"
if curl -s http://localhost:5173 &>/dev/null; then
    echo -e "${GREEN}✅ Running on http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    echo "   Run: cd frontend && npm run dev"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
ALL_OK=true
if ! mysql -u root -e "SELECT 1;" 2>/dev/null; then ALL_OK=false; fi
if ! curl -s http://localhost:3000/api/health &>/dev/null; then ALL_OK=false; fi
if ! curl -s http://localhost:5173 &>/dev/null; then ALL_OK=false; fi

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✅ Everything is running!${NC}"
    echo ""
    echo "🌐 Open: http://localhost:5173"
else
    echo -e "${YELLOW}⚠️  Some services are not running${NC}"
    echo ""
    echo "🚀 To start everything: ./start-everything.sh"
fi

echo ""
