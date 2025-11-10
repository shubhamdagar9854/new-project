var express = require('express');
const passport = require('passport');
var router = express.Router();
const LocalStrategy = require("passport-local").Strategy;
const userModel = require("./users");
const multer = require('multer');
const path = require('path');
const fs = require('fs');


passport.use(new LocalStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/login', function (req, res) {
  res.render('login'); // ye login.ejs ko render karega
});
router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}));


router.get('/profile', isLoggedIn, function (req, res, next) {
  res.render('profile', { user: req.user }); // ✅ Proper render
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, req.user.username + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Upload route
router.post('/upload', isLoggedIn, upload.single('dp'), async (req, res) => {
  try {
    req.user.dp = req.file.filename;
    await req.user.save();
    res.redirect('/profile');
  } catch (err) {
    console.log(err);
    res.send('File upload error: ' + err.message);
  }
});








router.post('/register', async function (req, res, next) {
  try {
    // Pehle check karo user already exist to nahi
    const existingUser = await userModel.findOne({ username: req.body.username });
    if (existingUser) {
      return res.send("❌ Username already exists, please try another one.");
    }

    // Naya user create karo
    const newUser = new userModel({
      username: req.body.username,
      email: req.body.email,
    });

    await userModel.register(newUser, req.body.password);
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  } catch (err) {
    console.error(err);
    res.send("Something went wrong: " + err.message);
  }
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}), function (req, res) { });

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
