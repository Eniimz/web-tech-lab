var express = require("express");
var router = express.Router();
// var Product = require("../models/Product");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* GET home page. */
router.get("/login", function (req, res, next) {
  return res.render("site/login");
});

router.post("/login", async function (req, res, next) {
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash("danger", "User with this email not present");
    return res.redirect("/login");
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (validPassword) {
    req.session.user = user;
    req.flash("success", "Logged in Successfully");
    // Redirect admin users to admin panel, others to homepage
    if (user.roles && user.roles.includes("admin")) {
      return res.redirect("/admin");
    }
    return res.redirect("/");
  } else {
    req.flash("danger", "Invalid Password");
    return res.redirect("/login");
  }
});

router.get("/register", function (req, res, next) {
  return res.render("site/register");
});

router.get("/logout", async (req, res) => {
  req.session.user = null;
  console.log("session clear");
  return res.redirect("/login");
});

router.post("/register", async function (req, res, next) {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    req.flash("danger", "User with given email already registered");
    return res.redirect("/register");
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });
  
  await newUser.save();

  return res.redirect("/login");
});

module.exports = router;
