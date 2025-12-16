var express = require('express');
var router = express.Router();
const userModel = require('../models/user');
const passport = require('passport');

// Admin login page
router.get('/login', (req, res) => {
  res.render('admin-login');
});

// Admin login
router.post('/login', passport.authenticate('local'), (req, res) => {
    if (req.user.userType !== 'admin') {
      req.logout(() => {
        return res.render('admin-login', {
          error: 'Admin access only'
        });
      });
      return;
    }
  res.redirect('/admin/dashboard');
});

// Admin dashboard (pending users)
router.get('/dashboard', isAdmin, async (req, res) => {
  const pendingUsers = await userModel.find({ isApproved: false });
  res.render('admin-dashboard', { users: pendingUsers });
});

// Approve user
router.post('/approve/:userId', isAdmin, async (req, res) => {
  await userModel.findByIdAndUpdate(req.params.userId, {
    isApproved: true,
    approvedBy: req.user._id,
    approvedAt: new Date()
  });
  res.json({ success: true, message: 'User approved' });
});

// Middleware - Admin check
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.userType === 'admin') {
    return next();
  }
  res.redirect('/admin/login');
}

module.exports = router;
