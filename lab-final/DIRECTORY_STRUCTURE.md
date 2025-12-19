# Directory Structure Explanation

## 📁 Current Structure

```
lab-final/
├── admin/                    # ❌ UNUSED - React app (not integrated)
├── app.js                    # ✅ Main Express application configuration
├── bin/
│   └── www                  # ✅ Entry point (starts the server)
├── config/                  # ✅ Configuration files
│   ├── development.json     # ✅ Database, port, secrets
│   └── custom-environment-variables.json  # ✅ Env var mapping
├── middlewares/            # ✅ Custom middleware functions
│   ├── sessionAuth.js       # ✅ Sets user data for all views
│   ├── checkSessionAuth.js  # ✅ Protects routes (requires login)
│   ├── checkAdminAuth.js    # ✅ Protects admin routes (requires admin role)
│   ├── apiauth.js          # ❌ UNUSED - JWT auth for API (not registered)
│   └── super-admin.js      # ❌ UNUSED - Super admin layout (not used)
├── models/                 # ✅ Mongoose database models
│   ├── Product.js          # ✅ Product schema
│   ├── User.js             # ✅ User schema
│   └── Category.js         # ⚠️  Defined but not actively used
├── node_modules/           # ✅ Installed dependencies
├── public/                 # ✅ Static files (served directly)
│   ├── images/            # ✅ Image assets
│   │   ├── assets/        # ✅ Homepage images
│   │   └── uploaded/      # ✅ User uploaded images (empty)
│   └── stylesheets/       # ✅ CSS files
│       ├── main-style.css # ✅ Main site styles
│       ├── admin-style.css # ✅ Admin panel styles
│       └── style.css      # ⚠️  May be unused
├── routes/                 # ✅ Route handlers
│   ├── index.js           # ✅ Login, register, logout routes
│   ├── shop.js            # ✅ Homepage, products, cart, checkout, CRUD
│   ├── admin.js           # ✅ Admin panel routes (CRUD for products)
│   ├── protected.js       # ✅ My account route
│   └── api/               # ❌ UNUSED - API routes (not registered in app.js)
│       ├── auth.js        # ❌ JWT authentication API
│       ├── catagories.js  # ❌ Categories API
│       ├── products.js    # ❌ Products API
│       └── public/        # ❌ Public API routes
├── views/                 # ✅ EJS templates
│   ├── admin/             # ✅ Admin panel views
│   │   ├── dashboard.ejs # ✅ Admin dashboard
│   │   ├── products-list.ejs # ✅ Product list page
│   │   └── product-form.ejs  # ✅ Add/edit product form
│   ├── site/              # ✅ Main website views
│   │   ├── home.ejs       # ✅ Homepage
│   │   ├── products.ejs   # ✅ Products listing
│   │   ├── cart.ejs       # ✅ Shopping cart
│   │   ├── checkout.ejs   # ✅ Checkout page
│   │   ├── login.ejs      # ✅ Login page
│   │   ├── register.ejs   # ✅ Registration page
│   │   ├── myaccount.ejs  # ✅ My account page
│   │   └── crud.ejs       # ✅ CRUD demo page (jQuery + JSONPlaceholder)
│   ├── layouts/           # ✅ Layout templates
│   │   ├── admin-layout.ejs # ✅ Admin panel layout
│   │   └── partials/      # ✅ Reusable partials
│   ├── error.ejs          # ✅ Error page
│   └── layout.ejs         # ⚠️  May be unused (using layouts/ instead)
├── package.json           # ✅ Dependencies and scripts
└── README.md              # ✅ Project documentation
```

## 📊 Usage Status

### ✅ USED (Active)
- `app.js` - Main application
- `bin/www` - Server entry point
- `config/` - Configuration
- `middlewares/sessionAuth.js` - User session management
- `middlewares/checkSessionAuth.js` - Login protection
- `middlewares/checkAdminAuth.js` - Admin protection
- `models/Product.js` - Product database model
- `models/User.js` - User database model
- `routes/index.js` - Authentication routes
- `routes/shop.js` - Main site routes
- `routes/admin.js` - Admin routes
- `routes/protected.js` - Protected routes
- `views/` - All EJS templates
- `public/` - Static assets

### ❌ UNUSED (Can be removed)
- `routes/api/` - Entire directory (not registered in app.js)
- `middlewares/apiauth.js` - JWT auth (only used by unused API routes)
- `middlewares/super-admin.js` - Not imported anywhere
- `admin/` - React app (separate project, not integrated)

### ⚠️  QUESTIONABLE
- `models/Category.js` - Defined but may not be actively used
- `views/layout.ejs` - May be unused (using `layouts/` instead)
- `public/stylesheets/style.css` - May be unused

## 🔍 How Routes Are Registered

In `app.js`, routes are registered like this:

```javascript
// Main routes
app.use("/", sessionAuth, indexRouter);        // /login, /register, /logout
app.use("/my-account", sessionAuth, checkSessionAuth, protectedRouter);
app.use("/", sessionAuth, require("./routes/shop"));  // /, /products, /cart, etc.

// Admin routes
app.use("/admin", sessionAuth, require("./routes/admin"));
```

**Notice:** There's NO `app.use("/api", ...)` registration, so the entire `routes/api/` directory is unused!

## 🎯 Simplified Structure (After Cleanup)

```
lab-final/
├── app.js                  # Express app configuration
├── bin/
│   └── www                 # Server entry point
├── config/                 # Configuration
├── middlewares/            # Only used middlewares
│   ├── sessionAuth.js
│   ├── checkSessionAuth.js
│   └── checkAdminAuth.js
├── models/                 # Database models
│   ├── Product.js
│   └── User.js
├── public/                 # Static files
│   ├── images/
│   └── stylesheets/
├── routes/                 # Only used routes
│   ├── index.js
│   ├── shop.js
│   ├── admin.js
│   └── protected.js
├── views/                  # Templates
│   ├── admin/
│   ├── site/
│   └── layouts/
└── package.json
```

