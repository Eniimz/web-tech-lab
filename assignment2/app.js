var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressLayouts = require("express-ejs-layouts");
var indexRouter = require("./routes/index");
var protectedRouter = require("./routes/protected");
var sessionAuth = require("./middlewares/sessionAuth");
var checkSessionAuth = require("./middlewares/checkSessionAuth");
var session = require("express-session");
var app = express();

var bodyParser = require("body-parser");

app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
var config = require("config");
app.use(
  session({
    secret: config.get("sessionSecret"),
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Main routes (working with mock data)
app.use("/", sessionAuth, indexRouter);
app.use("/my-account", sessionAuth, checkSessionAuth, protectedRouter);
app.use("/", sessionAuth, require("./routes/shop"));

// Admin routes
app.use("/admin", sessionAuth, require("./routes/admin"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
