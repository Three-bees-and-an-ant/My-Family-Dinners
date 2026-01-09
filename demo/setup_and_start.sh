#!/bin/bash

echo "🍽️  The Family Meals - Kurulum ve Başlatma"
echo "=========================================="
echo ""

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı!"
    echo ""
    echo "Lütfen önce Node.js kurun:"
    echo "  brew install node"
    echo ""
    echo "Kurulumdan sonra bu scripti tekrar çalıştırın."
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Proje dizinine git
cd "$(dirname "$0")"

# Bağımlılıkları yükle
echo "📦 Bağımlılıklar yükleniyor..."
if [ ! -d "backend/node_modules" ]; then
    echo "  - Backend bağımlılıkları..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "  - Frontend bağımlılıkları..."
    cd frontend && npm install && cd ..
fi

echo "✅ Bağımlılıklar yüklendi!"
echo ""

# .env kontrolü
if [ ! -f "backend/.env" ]; then
    echo "⚠️  .env dosyası bulunamadı!"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "✅ .env.example'dan .env oluşturuldu."
        echo "⚠️  Lütfen backend/.env dosyasını düzenleyip MySQL şifrenizi girin!"
        echo ""
        echo "Sonra şu komutları çalıştırın:"
        echo "  1. mysql -u root -p < backend/database/schema.sql"
        echo "  2. cd backend && npm run seed"
        echo "  3. Bu scripti tekrar çalıştırın"
        exit 1
    fi
fi

echo "🚀 Uygulama başlatılıyor..."
echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "İki terminal penceresi açılacak."
echo "Durdurmak için her terminalde Ctrl+C yapın."
echo ""

# Backend'i başlat
cd backend
npm run dev &
BACKEND_PID=$!
echo "✅ Backend başlatıldı (PID: $BACKEND_PID)"

# 3 saniye bekle
sleep 3

# Frontend'i başlat
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend başlatıldı (PID: $FRONTEND_PID)"
echo ""

cd ..

echo "🎉 Uygulama çalışıyor!"
echo ""
echo "Tarayıcıda http://localhost:5173 adresine gidin"
echo ""
echo "Durdurmak için: kill $BACKEND_PID $FRONTEND_PID"
echo "veya her terminalde Ctrl+C"
echo ""

# Process'leri bekle
wait







