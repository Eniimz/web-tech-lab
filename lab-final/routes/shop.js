var express = require("express");
var router = express.Router();
var Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const checkCartNotEmpty = require("../middlewares/checkCartNotEmpty");

/**
 * Cart View Route
 * 
 * Why cookies/sessions are used for cart instead of database:
 * - Temporary data: Cart is ephemeral, may be abandoned
 * - Performance: No database queries needed for every page load
 * - User experience: Works without login (guest shopping)
 * - Scalability: Reduces database load for temporary data
 * - Simplicity: Easy to implement and manage
 * 
 * How orders differ from carts conceptually:
 * - Cart: Temporary, stored in cookies, can be modified/deleted anytime
 * - Order: Permanent record, stored in database, immutable after creation
 * - Cart: User-specific but not persisted (lost if cookies cleared)
 * - Order: Persistent transaction record with status tracking
 * - Cart: Contains product IDs only
 * - Order: Contains product data snapshot (price, quantity) at time of purchase
 */
router.get("/cart", async function (req, res, next) {
  try {
    let cart = req.cookies.cart;
    if (!cart) cart = [];
    
    // Get products from MongoDB and filter out deleted products
    let products = [];
    let validCartIds = [];
    
    for (let id of cart) {
      try {
        let product = await Product.findById(id);
        if (product) {
          products.push(product);
          validCartIds.push(id);
        }
        // If product is null, it means it was deleted - silently remove from cart
      } catch (err) {
        console.error("Error fetching product:", err);
        // Invalid product ID - remove from cart
      }
    }
    
    // Update cart cookie to remove deleted products
    if (validCartIds.length !== cart.length) {
      res.cookie("cart", validCartIds);
    }

    // Recalculate total on server side for accuracy
    let total = products.reduce(
      (sum, product) => sum + (typeof product.price === 'number' ? product.price : Number(product.price)),
      0
    );

    res.render("site/cart", { products, total });
  } catch (error) {
    console.error("Error loading cart:", error);
    next(error);
  }
});

// Add product to cart route
// Note: This route doesn't validate if product exists - that's handled when cart is viewed
router.get("/add-cart/:id", function (req, res, next) {
  try {
    let cart = req.cookies.cart;
    if (!cart) cart = [];
    cart.push(req.params.id);
    res.cookie("cart", cart);
    req.flash("success", "Product Added To Cart");
    res.redirect("/");
  } catch (error) {
    console.error("Error adding to cart:", error);
    req.flash("error", "Failed to add product to cart.");
    res.redirect("/");
  }
});

// Products page with pagination and filtering
router.get("/products", async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter options
    const category = req.query.category || "";
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

    // Build query
    let query = {};
    if (category) {
      query.category = category;
    }
    if (minPrice !== null || maxPrice !== null) {
      query.price = {};
      if (minPrice !== null) query.price.$gte = minPrice;
      if (maxPrice !== null) query.price.$lte = maxPrice;
    }

    // Get products with pagination
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get unique categories for filter dropdown
    const categories = await Product.distinct("category");

    res.render("site/products", {
      layout: false,
      products,
      currentPage: page,
      totalPages,
      totalProducts,
      limit,
      categories,
      selectedCategory: category,
      minPrice: minPrice || "",
      maxPrice: maxPrice || "",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    next(error);
  }
});

/**
 * Checkout Page Route (GET)
 * 
 * Displays the checkout form with cart items and calculated totals.
 * Protected by checkCartNotEmpty middleware to ensure cart has items.
 * 
 * Process:
 * 1. Middleware ensures cart is not empty (already validated)
 * 2. Calculates product quantities from cart array
 * 3. Fetches product details from database using Promise.all for parallel queries
 * 4. Filters out deleted/invalid products (edge case handling)
 * 5. Recalculates totals on server-side for accuracy (prevents client-side manipulation)
 * 6. Renders checkout page with all data
 * 
 * Why recalculate on server:
 * - Security: Client-side calculations can be manipulated
 * - Accuracy: Server has latest product prices
 * - Data integrity: Ensures totals match actual product data
 */
router.get("/checkout", checkCartNotEmpty, async function (req, res, next) {
  try {
    const cart = req.cookies.cart || [];
    
    // Calculate quantities for each product ID
    const productQuantities = {};
    cart.forEach(id => {
      productQuantities[id] = (productQuantities[id] || 0) + 1;
    });
    
    // Get unique product IDs and fetch products from database in parallel
    const uniqueProductIds = [...new Set(cart)];
    const products = await Promise.all(
      uniqueProductIds.map(id => Product.findById(id))
    );
    
    // Filter out null products (handles deleted products - edge case)
    const validProducts = products.filter(p => p !== null);
    
    // Update cart if any products were deleted
    if (validProducts.length < products.length) {
      const validIds = validProducts.map(p => p._id.toString());
      const updatedCart = cart.filter(id => validIds.includes(id));
      res.cookie("cart", updatedCart);
    }

    // Recalculate totals on server-side for accuracy and security
    const subtotal = validProducts.reduce((sum, product) => {
      const qty = productQuantities[product._id] || 1;
      const price = Number(product.price);
      return sum + (price * qty);
    }, 0);
    
    const shipping = subtotal > 0 ? 10.00 : 0;
    const tax = subtotal * 0.10;
    const grandTotal = subtotal + shipping + tax;

    res.render("site/checkout", { 
      layout: false,
      products: validProducts, 
      productQuantities,
      subtotal, 
      shipping, 
      tax, 
      grandTotal 
    });
  } catch (error) {
    console.error("Error loading checkout:", error);
    // Proper async error handling - pass to Express error handler
    next(error);
  }
});

/**
 * Create Order Route (POST)
 * 
 * This route handles order creation from the checkout form.
 * Converts temporary cart data into a permanent order record.
 * 
 * Key differences between Cart and Order:
 * - Cart: Temporary, stored in cookies, can be abandoned
 * - Order: Permanent database record, represents completed transaction
 * - Cart: Only product IDs, prices fetched dynamically
 * - Order: Snapshot of product data (price, quantity) at purchase time
 * - Cart: User can modify/delete anytime
 * - Order: Immutable record, only status can change (Pending/Confirmed/Cancelled)
 * 
 * Process:
 * 1. Validates cart is not empty (middleware)
 * 2. Validates form inputs server-side
 * 3. Fetches current product data from database
 * 4. Calculates totals on server (security)
 * 5. Creates permanent order record with product snapshot
 * 6. Clears temporary cart cookie
 * 7. Redirects to order confirmation
 */
router.post("/checkout", checkCartNotEmpty, async function (req, res, next) {
  try {
    const cart = req.cookies.cart || [];

    // Server-side validation of required fields
    const { fullName, email } = req.body;
    
    // Validate fullName: required, non-empty, trimmed
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      req.flash("error", "Please provide your full name.");
      return res.redirect("/checkout");
    }
    
    // Validate email: required, non-empty, basic email format
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      req.flash("error", "Please provide your email address.");
      return res.redirect("/checkout");
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      req.flash("error", "Please provide a valid email address.");
      return res.redirect("/checkout");
    }
    
    // Validate name length (reasonable limit)
    if (fullName.trim().length > 100) {
      req.flash("error", "Name is too long. Maximum 100 characters allowed.");
      return res.redirect("/checkout");
    }

    // Calculate quantities for each product ID
    const productQuantities = {};
    cart.forEach(id => {
      productQuantities[id] = (productQuantities[id] || 0) + 1;
    });
    
    // Get unique product IDs and fetch products from database
    const uniqueProductIds = [...new Set(cart)];
    const products = await Promise.all(
      uniqueProductIds.map(id => Product.findById(id))
    );
    
    // Filter out null products (handles deleted products gracefully)
    const validProducts = products.filter(p => p !== null);

    if (validProducts.length === 0) {
      req.flash("error", "No valid products in cart. Some products may have been removed.");
      // Clear invalid cart
      res.cookie("cart", [], { maxAge: 0 });
      return res.redirect("/");
    }
    
    // Update cart to remove any deleted products
    const validProductIds = validProducts.map(p => p._id.toString());
    const updatedCart = cart.filter(id => validProductIds.includes(id));
    if (updatedCart.length !== cart.length) {
      res.cookie("cart", updatedCart);
      req.flash("info", "Some products were removed from your cart as they are no longer available.");
    }

    // Calculate totals
    const subtotal = validProducts.reduce((sum, product) => {
      const qty = productQuantities[product._id] || 1;
      const price = Number(product.price);
      return sum + (price * qty);
    }, 0);
    
    const shipping = subtotal > 0 ? 10.00 : 0;
    const tax = subtotal * 0.10;
    const grandTotal = subtotal + shipping + tax;

    // Create order items array
    const orderItems = validProducts.map(product => ({
      product: product._id,
      quantity: productQuantities[product._id] || 1,
      price: Number(product.price)
    }));

    // Create order in database
    const order = new Order({
      customerName: fullName.trim(),
      email: email.trim().toLowerCase(),
      items: orderItems,
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      totalAmount: grandTotal,
      status: "Pending"
    });

    await order.save();

    // Clear cart cookie
    res.cookie("cart", [], { maxAge: 0 });

    // Redirect to order confirmation page
    req.flash("success", "Order placed successfully!");
    res.redirect(`/order-confirmation/${order._id}`);
  } catch (error) {
    console.error("Error creating order:", error);
    req.flash("error", "Failed to create order. Please try again.");
    res.redirect("/checkout");
  }
});

/**
 * Order Confirmation Page Route
 * 
 * This route displays the order confirmation page after a successful order placement.
 * 
 * Key features:
 * - Uses populate() to fetch related product data from the Product collection
 *   instead of storing duplicate product data in the order document
 * - populate() creates a join-like operation: replaces product ObjectId references
 *   with actual Product documents from the database
 * - This is different from embedded documents where product data would be stored
 *   directly in the order document (denormalized approach)
 * 
 * Why populate() vs embedded documents:
 * - populate(): Normalized data, single source of truth, smaller order documents
 * - Embedded: Denormalized data, faster reads, but data duplication and sync issues
 * 
 * Error handling: Uses try-catch with next(error) to pass errors to Express error handler
 */
router.get("/order-confirmation/:orderId", async function (req, res, next) {
  try {
    const orderId = req.params.orderId;
    
    // populate() replaces items.product ObjectIds with full Product documents
    // This is a MongoDB join operation that fetches related data
    const order = await Order.findById(orderId).populate("items.product");
    
    if (!order) {
      req.flash("error", "Order not found.");
      return res.redirect("/");
    }

    res.render("site/order-confirmation", {
      layout: false,
      order: order
    });
  } catch (error) {
    console.error("Error loading order confirmation:", error);
    // Pass error to Express error handler middleware
    next(error);
  }
});

// CRUD page
router.get("/crud", function (req, res, next) {
  return res.render("site/crud", { layout: false });
});

// Main homepage
router.get("/", function (req, res, next) {
  return res.render("site/home", { layout: false });
});

module.exports = router;
