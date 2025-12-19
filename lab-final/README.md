# Lab Final - E-commerce Application

**Student:** Azaz Ahsan  
**Registration No:** SP23-BCS-35

## Technologies

- Node.js, Express.js
- MongoDB, Mongoose
- EJS Templates
- Bootstrap 5, jQuery
- Session-based authentication

## Features

- Product catalog with filtering & pagination
- Shopping cart functionality
- Checkout with order creation
- Admin panel (products & orders management)
- Order status management (Pending/Confirmed/Cancelled)
- Edge case handling (deleted products, form validation)
- Middleware for route protection

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure MongoDB connection in `config/development.json`

3. Start the application:
   ```bash
   npm start
   ```

4. Access the app at `http://localhost:3000`

## Admin Access

- Login with email: `admin@shop.com` (or user with admin role)
- Access admin panel at `/admin`
- Manage products at `/admin/products`
- Manage orders at `/admin/orders`

## Key Routes

- `/` - Homepage
- `/products` - Product catalog
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/admin` - Admin dashboard
- `/admin/orders` - Orders management
