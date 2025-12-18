# Assignment

**Student:** Azaz Ahsan  
**Registration No:** SP23-BCS-35

## Overview

A full-stack web application built with Node.js, Express.js, MongoDB, and EJS templating for server-side rendering.

## What's Implemented

### Frontend Features
- Responsive homepage with hero slider, icon boxes, and parallax sections
- Product listing page with pagination and category filtering
- Shopping cart functionality
- Checkout page with Bootstrap 5 form validation
- Single-page CRUD application using jQuery and JSONPlaceholder API

### Backend Features
- User authentication (login/register) with session management
- Product management with MongoDB integration
- Shopping cart using cookies
- Admin panel with separate layout for product CRUD operations

### Admin Panel
- Dashboard with statistics
- Product list with pagination
- Add/Edit/Delete products functionality
- Role-based access control (admin users only)

### Technologies Used
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Frontend:** EJS Templates, Bootstrap 5, jQuery
- **Database:** MongoDB
- **Styling:** Custom CSS, Bootstrap 5

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure MongoDB connection in `config/development.json`

3. Start the server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:4000`
