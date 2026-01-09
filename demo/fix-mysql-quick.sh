#!/bin/bash

# Quick MySQL Fix Script
# This script fixes the MySQL connection error

echo "🔧 MySQL Hızlı Düzeltme"
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
echo -e "${BLUE}📊 Step 1: MySQL'i başlatıyorum...${NC}"
brew services start mysql

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ MySQL başlatılamadı!${NC}"
    echo ""
    echo "Manuel olarak deneyin:"
    echo "  brew services start mysql"
    exit 1
fi

echo -e "${GREEN}✅ MySQL başlatıldı${NC}"
echo "MySQL'in tamamen başlaması için 10 saniye bekleniyor..."
sleep 10

# Step 2: Test MySQL Connection
echo ""
echo -e "${BLUE}📊 Step 2: MySQL bağlantısını test ediyorum...${NC}"

# Try different connection methods
if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL bağlantısı başarılı (şifre yok)${NC}"
elif mysql -u root -p -e "SELECT 1;" 2>/dev/null <<< ""; then
    echo -e "${GREEN}✅ MySQL bağlantısı başarılı (boş şifre)${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL bağlantısı test edilemedi${NC}"
    echo "MySQL'in başlaması için daha fazla bekleyin veya manuel kontrol edin:"
    echo "  mysql -u root -e 'SELECT 1;'"
fi

# Step 3: Check Database
echo ""
echo -e "${BLUE}📊 Step 3: Veritabanını kontrol ediyorum...${NC}"

if mysql -u root -e "USE family_meals; SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ 'family_meals' veritabanı mevcut${NC}"
else
    echo -e "${YELLOW}⚠️  'family_meals' veritabanı bulunamadı${NC}"
    echo ""
    echo "Veritabanını oluşturmak için:"
    echo "  mysql -u root < family_meals_complete.sql"
    echo ""
    echo "Veya EASY_SETUP.sh scriptini çalıştırın:"
    echo "  ./EASY_SETUP.sh"
fi

# Step 4: Check Backend .env
echo ""
echo -e "${BLUE}📊 Step 4: Backend .env dosyasını kontrol ediyorum...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  .env dosyası bulunamadı, oluşturuluyor...${NC}"
    cat > backend/.env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=family_meals
DB_PORT=3306
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ .env dosyası oluşturuldu${NC}"
else
    echo -e "${GREEN}✅ .env dosyası mevcut${NC}"
fi

# Step 5: Final Summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Düzeltme Tamamlandı!${NC}"
echo ""
echo "📋 Şimdi yapmanız gerekenler:"
echo ""
echo "1. Backend'i başlatın (Terminal 1):"
echo "   cd $SCRIPT_DIR/backend"
echo "   npm run dev"
echo ""
echo "2. Frontend'i başlatın (Terminal 2):"
echo "   cd $SCRIPT_DIR/frontend"
echo "   npm run dev"
echo ""
echo "3. Tarayıcıda açın:"
echo "   http://localhost:5173"
echo ""
echo -e "${YELLOW}⚠️  Eğer hala hata alırsanız:${NC}"
echo "   - MySQL'in tamamen başlaması için 30 saniye bekleyin"
echo "   - Backend'i yeniden başlatın"
echo "   - Veritabanını kontrol edin: mysql -u root -e 'USE family_meals; SHOW TABLES;'"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
