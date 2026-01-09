#!/bin/bash

# Export Database Script
# Exports family_meals database to SQL file

DB_NAME="family_meals"
DB_USER="root"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📤 Exporting Database...${NC}"
echo ""

# Create backup directory
mkdir -p $BACKUP_DIR

# Export full database (structure + data)
echo "Exporting full database..."
mysqldump -u $DB_USER $DB_NAME > $BACKUP_DIR/full_backup_$DATE.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Full backup: $BACKUP_DIR/full_backup_$DATE.sql${NC}"
else
    echo "❌ Export failed!"
    exit 1
fi

# Export only data
echo "Exporting data only..."
mysqldump -u $DB_USER --no-create-info $DB_NAME > $BACKUP_DIR/data_only_$DATE.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Data only: $BACKUP_DIR/data_only_$DATE.sql${NC}"
fi

# Export only structure
echo "Exporting structure only..."
mysqldump -u $DB_USER --no-data $DB_NAME > $BACKUP_DIR/structure_only_$DATE.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Structure only: $BACKUP_DIR/structure_only_$DATE.sql${NC}"
fi

# Export menu_items table
echo "Exporting menu_items table..."
mysqldump -u $DB_USER $DB_NAME menu_items > $BACKUP_DIR/menu_items_$DATE.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Menu items: $BACKUP_DIR/menu_items_$DATE.sql${NC}"
fi

# Export users table
echo "Exporting users table..."
mysqldump -u $DB_USER $DB_NAME users > $BACKUP_DIR/users_$DATE.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Users: $BACKUP_DIR/users_$DATE.sql${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Export Complete!${NC}"
echo ""
echo "Files saved in: $BACKUP_DIR/"
echo ""
echo "To import to another database:"
echo "  mysql -u root new_database < $BACKUP_DIR/full_backup_$DATE.sql"
echo ""
