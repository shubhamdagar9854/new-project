var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const expressSession = require("express-session");
const https = require('https');
const fs = require('fs');

// 🔹 Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

// 🔹 Passport auth
const passport = require('passport');
const userModel = require("./models/user");

var app = express();


// ================= VIEW ENGINE =================

// 🔹 EJS use kar rahe ho
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// ================= SESSION & PASSPORT =================

// 🔹 Session = login ke baad user ko yaad rakhne ke liye
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: "good bye"
}));

// 🔹 Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// 🔹 Passport user auth setup
passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());


// ================= MIDDLEWARE =================

app.use(logger('dev'));               // request log
app.use(express.json());              // JSON data read
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// ================= ROUTES =================

// 🔹 Normal pages
app.use('/', indexRouter);

// 🔹 User related routes
app.use('/users', usersRouter);

// 🔹 Admin routes (BEST PRACTICE)
app.use('/admin', adminRouter);


// ================= ERROR HANDLING =================

// 🔹 404 handler (routes ke baad hi aata hai)
app.use(function(req, res, next) {
  next(createError(404));
});

// 🔹 Common error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


// ================= HTTPS SERVER =================

// 🔹 SSL certificate files
const options = {
  key: fs.readFileSync('./localhost+2-key.pem'),
  cert: fs.readFileSync('./localhost+2.pem')
};

// 🔹 HTTPS server start (hamesha LAST me)
https.createServer(options, app).listen(3000, function() {
  console.log('🔒 HTTPS Server running at https://localhost:3000');
});
