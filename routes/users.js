var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/PRACTICE");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  userType: {
    type: String,
    enum: ['fresher', 'software_engineer', 'team_lead', 'project_manager', 'admin'], // admin add kiya
    required: true
  },

  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin'
  },
  approvedAt: Date,
  dp: String,
  posts: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});


userSchema.plugin(plm); // ye username & password khud add karega
module.exports = mongoose.model("user", userSchema);
