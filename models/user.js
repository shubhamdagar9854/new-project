const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  fullName: String,
  userType: String,
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  showWelcomePage: {
    type: Boolean,
    default: false
  }
});

// 🔹 Passport plugin
userSchema.plugin(passportLocalMongoose);

// ✅ VERY IMPORTANT LINE (Overwrite error ka permanent fix)
module.exports =
  mongoose.models.User || mongoose.model('User', userSchema);
