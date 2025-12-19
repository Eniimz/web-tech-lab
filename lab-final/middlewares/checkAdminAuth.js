// Middleware to check if user is authenticated and has admin role
async function checkAdminAuth(req, res, next) {
  if (!req.session.user) {
    req.flash("danger", "You need to login to access the admin panel");
    return res.redirect("/login");
  }
  
  // Check if user has admin role
  const user = req.session.user;
  if (!user.roles || !user.roles.includes("admin")) {
    req.flash("danger", "You don't have permission to access the admin panel");
    return res.redirect("/");
  }
  
  next();
}

module.exports = checkAdminAuth;

