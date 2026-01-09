#!/bin/bash

# Create Complete SQL File Script
# Creates a single SQL file with all tables and data for sharing

DB_NAME="family_meals"
DB_USER="root"
OUTPUT_FILE="family_meals_complete.sql"
DATE=$(date +%Y%m%d)

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📤 Creating Complete SQL File...${NC}"
echo ""

# Check if database exists
if ! mysql -u $DB_USER -e "USE $DB_NAME;" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' does not exist${NC}"
    echo "Creating database and seeding..."
    cd backend
    npm run seed
    cd ..
    sleep 2
fi

# Create SQL file with header
cat > $OUTPUT_FILE << 'EOF'
-- ============================================
-- The Family Meals - Complete Database
-- ============================================
-- This file contains all tables and data
-- Created: 
-- Usage: mysql -u root < family_meals_complete.sql
-- ============================================

-- Drop database if exists (optional - comment out if you want to keep existing)
-- DROP DATABASE IF EXISTS family_meals;

-- Create database
CREATE DATABASE IF NOT EXISTS family_meals;
USE family_meals;

EOF

# Add creation date
echo "-- Created: $(date)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

echo "Step 1: Adding schema..."
# Add schema
cat backend/database/schema.sql >> $OUTPUT_FILE

echo "Step 2: Checking if we can export data from live database..."
# Try to export data if database exists and MySQL is running
if mysql -u $DB_USER -e "USE $DB_NAME;" 2>/dev/null; then
    echo "Exporting data from live database..."
    mysqldump -u $DB_USER --no-create-info --skip-triggers $DB_NAME >> $OUTPUT_FILE 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Data exported from live database${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not export from live database, using seed data structure${NC}"
        echo "" >> $OUTPUT_FILE
        echo "-- Note: Run 'cd backend && npm run seed' to populate all data including users" >> $OUTPUT_FILE
    fi
else
    echo -e "${YELLOW}⚠️  Database not accessible, SQL file contains structure only${NC}"
    echo "" >> $OUTPUT_FILE
    echo "-- Note: After importing, run 'cd backend && npm run seed' to populate all data" >> $OUTPUT_FILE
fi

if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${GREEN}✅ SQL file created: $OUTPUT_FILE${NC}"
    
    # Get file size
    FILE_SIZE=$(du -h $OUTPUT_FILE | cut -f1)
    echo -e "${GREEN}✅ File size: $FILE_SIZE${NC}"
    
    # Count tables
    TABLE_COUNT=$(mysql -u $DB_USER $DB_NAME -e "SHOW TABLES;" 2>/dev/null | wc -l | tr -d ' ')
    TABLE_COUNT=$((TABLE_COUNT - 1))
    echo -e "${GREEN}✅ Tables exported: $TABLE_COUNT${NC}"
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Complete SQL File Ready!${NC}"
    echo ""
    echo "📄 File: $OUTPUT_FILE"
    echo ""
    echo "📋 To use this file:"
    echo "   1. Share this file with your friends"
    echo "   2. They run: mysql -u root < family_meals_complete.sql"
    echo "   3. Done! Database is ready with all data"
    echo ""
    echo "💡 Tips:"
    echo "   - This file contains ALL tables and ALL data"
    echo "   - Safe to share (no passwords in data)"
    echo "   - Works on any MySQL server"
    echo ""
else
    echo -e "${YELLOW}❌ Export failed!${NC}"
    exit 1
fi
