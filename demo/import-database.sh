#!/bin/bash

# Import Database Script
# Imports SQL file to a database

if [ $# -lt 2 ]; then
    echo "Usage: ./import-database.sh <source_file.sql> <target_database> [username]"
    echo ""
    echo "Example:"
    echo "  ./import-database.sh backups/full_backup.sql new_family_meals"
    echo "  ./import-database.sh backups/full_backup.sql new_family_meals root"
    exit 1
fi

SOURCE_FILE=$1
TARGET_DB=$2
DB_USER=${3:-root}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}❌ Error: File '$SOURCE_FILE' not found!${NC}"
    exit 1
fi

echo -e "${BLUE}📥 Importing Database...${NC}"
echo ""
echo "Source file: $SOURCE_FILE"
echo "Target database: $TARGET_DB"
echo "User: $DB_USER"
echo ""

# Check if database exists
if mysql -u $DB_USER -e "USE $TARGET_DB;" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Database '$TARGET_DB' already exists${NC}"
    read -p "Do you want to continue? This may overwrite existing data. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Import cancelled."
        exit 1
    fi
else
    echo "Creating database '$TARGET_DB'..."
    mysql -u $DB_USER -e "CREATE DATABASE IF NOT EXISTS $TARGET_DB;"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database created${NC}"
    else
        echo -e "${RED}❌ Failed to create database${NC}"
        exit 1
    fi
fi

# Import
echo ""
echo "Importing data..."
mysql -u $DB_USER $TARGET_DB < $SOURCE_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Import Complete!${NC}"
    echo ""
    echo "Database: $TARGET_DB"
    echo "Source: $SOURCE_FILE"
    echo ""
    echo "Verify import:"
    echo "  mysql -u $DB_USER -e \"USE $TARGET_DB; SHOW TABLES;\""
else
    echo -e "${RED}❌ Import failed!${NC}"
    exit 1
fi
