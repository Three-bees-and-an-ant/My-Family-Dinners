#!/bin/bash

# Create Zip File for Friends
# Includes everything needed to run the project

echo "📦 Creating Zip File for Friends..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create complete SQL file first
echo -e "${BLUE}Step 1: Creating complete SQL file...${NC}"
./create-complete-sql.sh

if [ ! -f "family_meals_complete.sql" ]; then
    echo "⚠️  SQL file not created, but continuing..."
fi

# Create zip file
ZIP_NAME="the-family-meals-complete-$(date +%Y%m%d).zip"

echo ""
echo -e "${BLUE}Step 2: Creating zip file...${NC}"

# IMPORTANT: Make sure SQL file is included!
# Create zip (SQL file will be included automatically)
zip -r "$ZIP_NAME" . \
  -x "node_modules/*" \
  -x "frontend/node_modules/*" \
  -x "backend/node_modules/*" \
  -x ".git/*" \
  -x "*.log" \
  -x "backend/.env" \
  -x "*.zip" \
  -x ".DS_Store" \
  -x "backups/*" \
  -x "dist/*" \
  -x "frontend/dist/*" \
  > /dev/null 2>&1

# Verify SQL file is in zip and add if missing
if zipinfo "$ZIP_NAME" 2>/dev/null | grep -q "family_meals_complete.sql"; then
    echo -e "${GREEN}✅ SQL file included in zip${NC}"
else
    echo -e "${YELLOW}⚠️  SQL file not found in zip, adding manually...${NC}"
    zip "$ZIP_NAME" family_meals_complete.sql > /dev/null 2>&1
    if zipinfo "$ZIP_NAME" 2>/dev/null | grep -q "family_meals_complete.sql"; then
        echo -e "${GREEN}✅ SQL file added to zip${NC}"
    else
        echo -e "${RED}❌ WARNING: Could not add SQL file to zip!${NC}"
        echo "   Make sure family_meals_complete.sql exists in the project folder"
    fi
fi

if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$ZIP_NAME" | cut -f1)
    echo -e "${GREEN}✅ Zip file created: $ZIP_NAME${NC}"
    echo -e "${GREEN}✅ File size: $FILE_SIZE${NC}"
    echo ""
    echo "📋 What's included:"
    echo "   ✅ All source code"
    echo "   ✅ Complete SQL file (family_meals_complete.sql)"
    echo "   ✅ Setup scripts"
    echo "   ✅ All documentation"
    echo "   ✅ README_FOR_FRIENDS.md"
    echo ""
    echo "📤 Share this file with your friends!"
    echo ""
    echo "📝 Instructions for friends (EASIEST WAY):"
    echo "   1. Extract the zip"
    echo "   2. Run: chmod +x EASY_SETUP.sh"
    echo "   3. Run: ./EASY_SETUP.sh"
    echo "   4. Everything will be set up automatically!"
    echo ""
    echo "   Then start backend and frontend in separate terminals"
    echo ""
else
    echo "❌ Zip creation failed!"
    exit 1
fi
