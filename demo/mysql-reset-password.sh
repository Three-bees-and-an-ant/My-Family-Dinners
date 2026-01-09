#!/bin/bash

# Quick MySQL Password Reset Script

echo "🔧 MySQL Password Reset"
echo ""

# Method 1: Try to connect without password first
if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo "✅ MySQL is already accessible without password!"
    echo ""
    echo "Your backend/.env should have:"
    echo "  DB_PASSWORD="
    exit 0
fi

echo "MySQL requires a password. Let's reset it..."
echo ""

# Stop MySQL
echo "Step 1: Stopping MySQL..."
brew services stop mysql
sleep 2

# Start MySQL in safe mode
echo "Step 2: Starting MySQL in safe mode..."
mysqld_safe --skip-grant-tables &
SAFE_PID=$!
sleep 5

# Reset password
echo "Step 3: Resetting password..."
mysql -u root << EOF
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
EOF

# Stop safe mode MySQL
echo "Step 4: Stopping safe mode MySQL..."
kill $SAFE_PID 2>/dev/null
sleep 2

# Start MySQL normally
echo "Step 5: Starting MySQL normally..."
brew services start mysql
sleep 5

# Test
if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo ""
    echo "✅ Success! MySQL now works without password!"
    echo ""
    echo "Make sure your backend/.env has:"
    echo "  DB_PASSWORD="
else
    echo ""
    echo "❌ Could not reset password automatically"
    echo ""
    echo "Manual steps:"
    echo "1. Run: mysql -u root -p"
    echo "2. Enter your current MySQL password"
    echo "3. Run: ALTER USER 'root'@'localhost' IDENTIFIED BY '';"
    echo "4. Run: FLUSH PRIVILEGES;"
    echo "5. Exit and test: mysql -u root -e 'SELECT 1;'"
fi
