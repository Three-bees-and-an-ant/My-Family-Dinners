#!/bin/bash

# Quick MySQL Fix Script

echo "🔧 Quick MySQL Fix"
echo ""

# Method 1: Try brew services
echo "Method 1: Starting via Homebrew..."
brew services start mysql 2>&1
sleep 5

# Test connection
if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo "✅ MySQL started successfully!"
    exit 0
fi

# Method 2: Try manual start
echo ""
echo "Method 2: Trying manual start..."
if [ -f "/opt/homebrew/opt/mysql/support-files/mysql.server" ]; then
    /opt/homebrew/opt/mysql/support-files/mysql.server start
    sleep 3
    if mysql -u root -e "SELECT 1;" 2>/dev/null; then
        echo "✅ MySQL started successfully!"
        exit 0
    fi
fi

# Method 3: Try mysqld_safe
echo ""
echo "Method 3: Trying mysqld_safe..."
if command -v mysqld_safe &> /dev/null; then
    mysqld_safe --user=mysql &
    sleep 5
    if mysql -u root -e "SELECT 1;" 2>/dev/null; then
        echo "✅ MySQL started successfully!"
        exit 0
    fi
fi

echo ""
echo "❌ Could not start MySQL automatically"
echo ""
echo "Please try manually:"
echo "1. brew services start mysql"
echo "2. Or: /opt/homebrew/opt/mysql/support-files/mysql.server start"
echo "3. Or check MySQL installation: brew install mysql"
