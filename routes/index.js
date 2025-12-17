var express = require('express');
const passport = require('passport');
var router = express.Router();
const LocalStrategy = require("passport-local").Strategy;
const userModel = require('../models/user'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =====================================================
// PASSPORT CONFIGURATION
passport.use(new LocalStrategy(userModel.authenticate()));

// =====================================================
// HOME PAGE ROUTE
router.get('/', function (req, res, next) {
  res.redirect('/login');
});

// =====================================================
// LOGIN PAGE ROUTE
router.get('/login', function (req, res) {
  res.render('login');
});

// =====================================================
// SIGNUP PAGE ROUTE
router.get('/signup', function (req, res) {
  res.render('signup');
});

// =====================================================
// WELCOME PAGE ROUTE (after first approval)
router.get('/welcome', isLoggedIn, async (req, res) => {
  if (!req.user.showWelcomePage) {
    return res.redirect('/profile');
  }
  // Update flag to not show welcome page again
  await userModel.findByIdAndUpdate(req.user._id, { showWelcomePage: false });
  res.render('welcome', { user: req.user });
});

// =====================================================
// PROFILE PAGE ROUTE
router.get('/profile', isLoggedIn, function (req, res, next) {
  res.render('profile', { user: req.user });
});

// =====================================================
// MULTER CONFIGURATION
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../private/uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + req.user.username + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// =====================================================
// REGISTER/SIGNUP ROUTE
router.post('/register', async function (req, res, next) {
  try {
    const { username, email, password, userType } = req.body;

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!regex.test(password)) {
      return res.send("❌ Weak password. Must have: uppercase, lowercase, number, special char, min 8 characters");
    }
    if (!userType) {
      return res.send("❌ Please select your user type (Fresher/Software Engineer/Team Lead/Project Manager)");
    }
    const existingUser = await userModel.findOne({ username: username });
    if (existingUser) return res.send("❌ Username already exists.");
    const existingEmail = await userModel.findOne({ email: email });
    if (existingEmail) return res.send("❌ Email already registered.");

    const newUser = new userModel({
      username,
      email,
      userType,
      isApproved: false
    });

    // First admin auto-create
    const adminExists = await userModel.exists({ userType: 'admin' });
    if (!adminExists) {
      newUser.userType = 'admin';
      newUser.isApproved = true;
    }

    const registeredUser = await userModel.register(newUser, password);

    if (newUser.userType === 'admin') {
      res.send("✅ Registration successful! You are the first admin. You can login immediately.");
    } else {
      res.send("✅ Registration successful! Your account is pending admin approval.");
    }

  } catch (err) {
    console.error('Registration Error:', err);
    res.send("❌ Something went wrong: " + err.message);
  }
});

// =====================================================
// LOGIN ROUTE
router.post("/login", function(req, res, next) {
  passport.authenticate("local", async function(err, user, info) {
    if (err) return next(err);
    if (!user) return res.send("❌ Invalid username or password");

    // ✅ Fetch latest user to get updated approval status
    const freshUser = await userModel.findById(user._id);

    if (!freshUser.isApproved) {
      return res.send("⏳ Your account is pending admin approval. Please wait for admin to approve your account.");
    }

    req.logIn(freshUser, function(err) {
      if (err) return next(err);

      // 웰컴 페이지 리디렉션 로직
      if (freshUser.showWelcomePage) {
        return res.redirect('/welcome');
      }
      return res.redirect("/profile");
    });

  })(req, res, next);
});

// =====================================================
// FILE UPLOAD ROUTE
router.post('/upload', isLoggedIn, upload.single('dp'), async (req, res) => {
  try {
    req.user.dp = req.file.filename;
    await req.user.save();
    res.redirect('/profile');
  } catch (err) {
    console.log('Upload Error:', err);
    res.send('❌ File upload error: ' + err.message);
  }
});

// =====================================================
// PHOTO ACCESS ROUTE
router.get('/photo/:filename', isLoggedIn, function (req, res) {
  if (req.user.dp !== req.params.filename) {
    return res.status(403).send("❌ Unauthorized - You can only access your own photos");
  }
  const photoPath = path.join(__dirname, '../private/uploads', req.params.filename);
  res.sendFile(photoPath);
});

// =====================================================
// LOGOUT ROUTE
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/login");
  });
});

// =====================================================
// AUTH MIDDLEWARE
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

// =====================================================
// EXPORT ROUTER
module.exports = router;
