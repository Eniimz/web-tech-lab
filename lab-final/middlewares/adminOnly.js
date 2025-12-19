/**
 * Middleware to check if user email equals admin@shop.com
 * Allows access only if the logged-in user's email is admin@shop.com
 * Redirects to home page with error message if not authorized
 */
function adminOnly(req, res, next) {
  if (!req.session.user) {
    req.flash("danger", "You need to login to access this page");
    return res.redirect("/login");
  }
  
  const userEmail = req.session.user.email;
  if (userEmail !== "admin@shop.com") {
    req.flash("danger", "You don't have permission to access this page. Admin access required.");
    return res.redirect("/");
  }
  
  next();
}

module.exports = adminOnly;

