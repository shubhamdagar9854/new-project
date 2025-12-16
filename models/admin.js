const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

adminSchema.plugin(plm);
module.exports = mongoose.model("admin", adminSchema);