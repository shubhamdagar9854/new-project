var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/PRACTICE");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  dp: String, // agar profile pic future me add karni ho
  posts: [String], // agar user ke posts rakhne ho
});

userSchema.plugin(plm); // ye username & password khud add karega
module.exports = mongoose.model("user", userSchema);
