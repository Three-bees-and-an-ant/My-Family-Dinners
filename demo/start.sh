#!/bin/bash

# The Family Meals - Başlatma Scripti

echo "🍽️  The Family Meals - Uygulama Başlatılıyor..."
echo ""

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo "❌ Node.js bulunamadı!"
    echo "Lütfen önce Node.js kurun:"
    echo "  brew install node"
    echo "  veya"
    echo "  https://nodejs.org adresinden indirin"
    exit 1
fi

echo "✅ Node.js bulundu: $(node --version)"
echo ""

# npm kontrolü
if ! command -v npm &> /dev/null; then
    echo "❌ npm bulunamadı!"
    exit 1
fi

echo "✅ npm bulundu: $(npm --version)"
echo ""

# MySQL kontrolü
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL bulunamadı!"
    echo "MySQL kurulu olmalı. Devam ediyoruz..."
    echo ""
fi

# Bağımlılıkları kontrol et
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Backend bağımlılıkları yükleniyor..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Frontend bağımlılıkları yükleniyor..."
    cd frontend && npm install && cd ..
fi

# .env dosyasını kontrol et
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env dosyası bulunamadı!"
    echo "backend/.env.example dosyasını kopyalayıp düzenleyin."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "✅ .env.example'dan .env oluşturuldu. Lütfen düzenleyin!"
    fi
    exit 1
fi

echo ""
echo "🚀 Uygulama başlatılıyor..."
echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "İki terminal penceresi açılacak:"
echo "  1. Backend server"
echo "  2. Frontend dev server"
echo ""
echo "Durdurmak için: Ctrl+C"
echo ""

# Backend'i arka planda başlat
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 2 saniye bekle
sleep 2

# Frontend'i arka planda başlat
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Uygulama başlatıldı!"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Durdurmak için: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Process'leri bekle
wait

