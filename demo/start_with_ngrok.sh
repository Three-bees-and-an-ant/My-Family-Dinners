#!/bin/bash

echo "🌐 Starting application with ngrok tunnel..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "Install ngrok:"
    echo "  brew install ngrok/ngrok/ngrok"
    echo ""
    echo "Or download from: https://ngrok.com/download"
    exit 1
fi

# Check if backend is running
if ! lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  Backend is not running on port 3000"
    echo "Starting backend..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID)"
    sleep 3
    cd ..
fi

# Check if frontend is running
if ! lsof -ti:5173 > /dev/null 2>&1; then
    echo "⚠️  Frontend is not running on port 5173"
    echo "Starting frontend..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
    sleep 3
    cd ..
fi

echo ""
echo "🚀 Starting ngrok tunnel for frontend (port 5173)..."
echo ""

# Start ngrok tunnel
ngrok http 5173 --log=stdout &
NGROK_PID=$!

sleep 5

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null)

if [ -z "$NGROK_URL" ]; then
    echo "⚠️  Could not get ngrok URL automatically"
    echo "Please check ngrok dashboard: http://localhost:4040"
    echo ""
    echo "Or run manually:"
    echo "  ngrok http 5173"
else
    echo "✅ Ngrok tunnel is active!"
    echo ""
    echo "🌍 Public URL (share this with your friend):"
    echo "   $NGROK_URL"
    echo ""
    echo "📊 Ngrok Dashboard: http://localhost:4040"
    echo ""
    echo "Press Ctrl+C to stop"
fi

# Wait for user interrupt
wait $NGROK_PID







