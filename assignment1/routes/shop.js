var express = require("express");
var router = express.Router();
var Product = require("../models/Product");
const Category = require("../models/Category");

router.get("/cart", async function (req, res, next) {
  let cart = req.cookies.cart;
  if (!cart) cart = [];
  
  // Get products from MongoDB
  let products = [];
  for (let id of cart) {
    try {
      let product = await Product.findById(id);
      if (product) products.push(product);
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  }

  let total = products.reduce(
    (total, product) => total + (typeof product.price === 'number' ? product.price : Number(product.price)),
    0
  );

  res.render("site/cart", { products, total });
});

router.get("/add-cart/:id", function (req, res, next) {
  let cart = req.cookies.cart;
  if (!cart) cart = [];
  cart.push(req.params.id);
  res.cookie("cart", cart);
  req.flash("success", "Product Added To Cart");
  res.redirect("/");
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

// Checkout page
router.get("/checkout", async function (req, res, next) {
  let cart = req.cookies.cart;
  if (!cart) cart = [];
  
  // Calculate quantities (count occurrences of each product ID)
  let productQuantities = {};
  cart.forEach(id => {
    productQuantities[id] = (productQuantities[id] || 0) + 1;
  });
  
  // Get unique products from MongoDB
  let uniqueProductIds = [...new Set(cart)];
  let products = [];
  for (let id of uniqueProductIds) {
    try {
      let product = await Product.findById(id);
      if (product) products.push(product);
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  }

  // Calculate totals
  let subtotal = 0;
  products.forEach(product => {
    const qty = productQuantities[product._id] || 1;
    const price = typeof product.price === 'number' ? product.price : Number(product.price);
    subtotal += price * qty;
  });
  
  const shipping = subtotal > 0 ? 10.00 : 0;
  const tax = subtotal * 0.10; // 10% tax
  const grandTotal = subtotal + shipping + tax;

  res.render("site/checkout", { 
    layout: false,
    products, 
    productQuantities,
    subtotal, 
    shipping, 
    tax, 
    grandTotal 
  });
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
