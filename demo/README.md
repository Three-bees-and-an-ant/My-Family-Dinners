# 🍽️ The Family Meals

Web application for healthy family meals. A platform where working families can plan and order healthy meals for their children.

## ✨ Features

- 🥗 Healthy meal menu (calories, protein, carbs, fat information)
- 📅 Meal planning from 24 hours to 30 days ahead
- 📆 Monthly meal planning and calorie tracking
- 👨‍👩‍👧‍👦 Family members management
- 🛒 Shopping cart and order management
- 🔔 Notification system (simulated)
- 👥 Multiple user roles (User, Staff, Admin)
- 📊 Admin panel and log tracking

## 🚀 Quick Start

### Requirements

- Node.js (v18+)
- MySQL (v8.0+)
- npm

### Automatic Setup (Recommended)

```bash
# One command setup - does everything automatically
chmod +x EASY_SETUP.sh
./EASY_SETUP.sh
```

This script will:
1. Check/Install MySQL
2. Start MySQL service
3. Import SQL database
4. Create users
5. Install dependencies
6. Create .env file

After setup, start the application:
```bash
# Terminal 1: Start Backend
cd backend && npm run dev

# Terminal 2: Start Frontend
cd frontend && npm run dev
```

### Quick Fix for MySQL Errors

If you get "Server error: Please check if MySQL is running":

```bash
# Quick fix script
chmod +x fix-mysql-quick.sh
./fix-mysql-quick.sh
```

Or manually:
```bash
# 1. Start MySQL
brew services start mysql

# 2. Wait 10 seconds for MySQL to start

# 3. Test connection
mysql -u root -e "SELECT 1;"

# 4. Restart backend
cd backend && npm run dev
```

## 🌐 Erişim

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health

## 🔑 Demo Giriş Bilgileri

**End User:**
- Email: `user@demo.com`
- Password: `password123`

**Staff:**
- Email: `staff@demo.com`
- Password: `password123`

**Admin:**
- Email: `admin@demo.com`
- Password: `password123`

## 🌍 Sharing with Friends

### Method 1: Ngrok (Internet Access)

```bash
# Start Ngrok
ngrok http 5173

# Share the URL (e.g., https://xxxxx.ngrok-free.dev)
```

### Method 2: Zip Sharing

```bash
# Create zip
zip -r the-family-meals.zip . \
  -x "node_modules/*" \
  -x "frontend/node_modules/*" \
  -x "backend/node_modules/*" \
  -x ".git/*" \
  -x "*.log" \
  -x ".env"

# Share the zip file
```

For detailed information, see `SHARE_WITH_FRIENDS.md` file.

## 📁 Proje Yapısı

```
the-family-meals/
├── backend/              # Node.js + Express backend
│   ├── controllers/      # Route controllers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, validation, etc.
│   ├── database/         # MySQL schema and migrations
│   ├── scripts/          # Seed scripts
│   └── utils/            # Utilities
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React contexts
│   │   └── utils/        # Utilities
│   └── public/
├── SETUP_GUIDE.md        # Detailed setup guide
├── SHARE_WITH_FRIENDS.md # Sharing guide
├── QUICK_SETUP.sh        # Automatic setup script
└── start.sh              # Start script
```

## 🛠️ Teknolojiler

### Backend
- Node.js + Express
- MySQL
- JWT Authentication
- bcryptjs (password hashing)
- express-validator (validation)
- express-rate-limit (rate limiting)
- helmet (security headers)

### Frontend
- React 18
- Vite
- React Router
- Axios
- Context API

## 📋 API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item details
- `POST /api/menu` - Create menu item (Staff/Admin)
- `PUT /api/menu/:id` - Update menu item (Staff/Admin)
- `DELETE /api/menu/:id` - Delete menu item (Staff/Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/pending/all` - Get pending orders (Staff/Admin)
- `PUT /api/orders/:id/confirm` - Confirm order (Staff/Admin)
- `PUT /api/orders/:id/reject` - Reject order (Staff/Admin)

### Meal Plans
- `GET /api/meal-plans` - Get user meal plans
- `POST /api/meal-plans` - Create meal plan
- `GET /api/meal-plans/:id` - Get meal plan details
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### Admin
- `GET /api/admin/logs` - Get system logs
- `GET /api/admin/stats` - Get statistics
- `PUT /api/admin/restaurant/toggle` - Toggle restaurant status

## 🔒 Güvenlik Özellikleri

- ✅ JWT Authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation (express-validator)
- ✅ Rate limiting
- ✅ Security headers (helmet)
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS configuration
- ✅ Error handling

## 📊 Database

MySQL database schema:
- `users` - Users
- `menu_items` - Menu items (with nutritional values)
- `orders` - Orders
- `order_items` - Order items
- `notifications` - Notifications
- `meal_plans` - Monthly meal plans
- `meal_plan_items` - Meal plan items
- `family_members` - Family members
- `logs` - System logs
- `restaurant_settings` - Restaurant settings

## 🎯 Usage Scenarios

1. **User:** Selects meals from menu, adds to cart, places order
2. **User:** Creates monthly meal plan, tracks calories
3. **Staff:** Views incoming orders, confirms/rejects them
4. **Admin:** Views system logs, enables/disables restaurant

## 🐛 Troubleshooting

### MySQL Connection Error

**Error:** "Server error: Please check if MySQL is running and database is properly configured."

**Quick Fix:**
```bash
# Run the quick fix script
./fix-mysql-quick.sh

# Or manually:
brew services start mysql
sleep 10
cd backend && npm run dev
```

### Database Not Found

**Error:** "Database does not exist"

**Fix:**
```bash
# Import the database
mysql -u root < family_meals_complete.sql

# Or run the setup script
./EASY_SETUP.sh
```

### Backend Not Starting

**Check:**
1. MySQL is running: `brew services list | grep mysql`
2. Database exists: `mysql -u root -e "USE family_meals; SHOW TABLES;"`
3. .env file exists: `ls backend/.env`
4. Dependencies installed: `cd backend && npm install`

## 📝 License

This project is for demo purposes.

## 👥 Contributing

This is a demo project. Developed for university project.

## 📞 Contact

For questions, contact the project owner.

---

**Note:** This is a demo project. Additional security measures should be taken for production use.
