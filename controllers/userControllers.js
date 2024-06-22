const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/userModel");

exports.homepage = catchAsyncError(async (req, res, next) => {
  res.json({ message: "homepage" });
});

exports.registeruser = catchAsyncError(async (req, res, next) => {
  const user = await new User(req.body).save();

  res.status(201).json(user);
});
