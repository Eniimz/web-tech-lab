var express = require("express");
var router = express.Router();
var Product = require("../models/Product");
var Order = require("../models/Order");
var checkAdminAuth = require("../middlewares/checkAdminAuth");
var mongoose = require("mongoose");

// All admin routes require authentication and admin role
router.use(checkAdminAuth);

// Admin Dashboard
router.get("/", async function (req, res, next) {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Product.distinct("category").then(cats => cats.length);
    
    // Get some recent products
    const recentProducts = await Product.find()
      .sort({ _id: -1 })
      .limit(5)
      .select("name price category image");
    
    res.render("admin/dashboard", {
      layout: "layouts/admin-layout",
      title: "Dashboard",
      totalProducts,
      totalCategories,
      recentProducts,
    });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    next(error);
  }
});

// Products List
router.get("/products", async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    res.render("admin/products-list", {
      layout: "layouts/admin-layout",
      title: "Products",
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error("Error loading products:", error);
    next(error);
  }
});

// Add Product Form
router.get("/products/add", function (req, res, next) {
  res.render("admin/product-form", {
    layout: "layouts/admin-layout",
    title: "Add Product",
    product: null,
    formAction: "/admin/products/add",
    formMethod: "POST",
  });
});

// Create Product (POST)
router.post("/products/add", async function (req, res, next) {
  try {
    const product = new Product({
      name: req.body.name,
      price: parseFloat(req.body.price),
      color: req.body.color,
      category: req.body.category,
      department: req.body.department,
      description: req.body.description,
      image: req.body.image,
    });

    await product.save();
    req.flash("success", "Product created successfully!");
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error creating product:", error);
    req.flash("danger", "Error creating product: " + error.message);
    res.redirect("/admin/products/add");
  }
});

// Edit Product Form
router.get("/products/edit/:id", async function (req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      req.flash("danger", "Invalid product ID");
      return res.redirect("/admin/products");
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash("danger", "Product not found");
      return res.redirect("/admin/products");
    }

    res.render("admin/product-form", {
      layout: "layouts/admin-layout",
      title: "Edit Product",
      product,
      formAction: `/admin/products/edit/${req.params.id}`,
      formMethod: "POST",
    });
  } catch (error) {
    console.error("Error loading product:", error);
    req.flash("danger", "Error loading product");
    res.redirect("/admin/products");
  }
});

// Update Product (POST)
router.post("/products/edit/:id", async function (req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      req.flash("danger", "Invalid product ID");
      return res.redirect("/admin/products");
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash("danger", "Product not found");
      return res.redirect("/admin/products");
    }

    product.name = req.body.name;
    product.price = parseFloat(req.body.price);
    product.color = req.body.color;
    product.category = req.body.category;
    product.department = req.body.department;
    product.description = req.body.description;
    product.image = req.body.image;

    await product.save();
    req.flash("success", "Product updated successfully!");
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error updating product:", error);
    req.flash("danger", "Error updating product: " + error.message);
    res.redirect(`/admin/products/edit/${req.params.id}`);
  }
});

// Delete Product
router.post("/products/delete/:id", async function (req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      req.flash("danger", "Invalid product ID");
      return res.redirect("/admin/products");
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      req.flash("danger", "Product not found");
      return res.redirect("/admin/products");
    }

    req.flash("success", "Product deleted successfully!");
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error deleting product:", error);
    req.flash("danger", "Error deleting product");
    res.redirect("/admin/products");
  }
});

// Admin Orders List
router.get("/orders", async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    res.render("admin/orders-list", {
      layout: "layouts/admin-layout",
      title: "Orders",
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error("Error loading orders:", error);
    next(error);
  }
});

// Update Order Status - Mark as Confirmed
router.post("/orders/confirm/:id", async function (req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      req.flash("danger", "Invalid order ID");
      return res.redirect("/admin/orders");
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      req.flash("danger", "Order not found");
      return res.redirect("/admin/orders");
    }

    order.status = "Confirmed";
    await order.save();

    req.flash("success", "Order marked as Confirmed!");
    res.redirect("/admin/orders");
  } catch (error) {
    console.error("Error updating order status:", error);
    req.flash("danger", "Error updating order status");
    res.redirect("/admin/orders");
  }
});

// Update Order Status - Cancel Order
router.post("/orders/cancel/:id", async function (req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      req.flash("danger", "Invalid order ID");
      return res.redirect("/admin/orders");
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      req.flash("danger", "Order not found");
      return res.redirect("/admin/orders");
    }

    order.status = "Cancelled";
    await order.save();

    req.flash("success", "Order cancelled successfully!");
    res.redirect("/admin/orders");
  } catch (error) {
    console.error("Error cancelling order:", error);
    req.flash("danger", "Error cancelling order");
    res.redirect("/admin/orders");
  }
});

module.exports = router;

