/**
 * Middleware: checkCartNotEmpty
 * 
 * Purpose: Prevents users from accessing checkout routes when their cart is empty.
 * This middleware is reusable and can be applied to any route that requires a non-empty cart.
 * 
 * How it works:
 * 1. Reads the cart from cookies (cart is stored as an array of product IDs)
 * 2. Checks if cart array has any items
 * 3. If empty: sets flash error message and redirects to home page
 * 4. If not empty: calls next() to continue to the route handler
 * 
 * Why middleware is preferred over repeated logic:
 * - DRY principle: Write once, use anywhere
 * - Consistent behavior across all protected routes
 * - Easy to maintain: change logic in one place
 * - Cleaner route handlers: focus on business logic, not validation
 * 
 * Usage: router.get("/checkout", checkCartNotEmpty, handlerFunction)
 */
function checkCartNotEmpty(req, res, next) {
  const cart = req.cookies.cart || [];
  
  if (cart.length === 0) {
    req.flash("error", "Your cart is empty. Add items to cart first.");
    return res.redirect("/");
  }
  
  next();
}

module.exports = checkCartNotEmpty;

