const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");

exports.homepage = catchAsyncError(async (req, res, next) => {
  res.json({ message: "homepage" });
});

exports.registeruser = catchAsyncError(async (req, res, next) => {
  const user = await new User(req.body).save();

  res.status(201).json(user);
});

exports.loginuser = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ username: req.body.username })
    .select("+password")
    .exec();

  if (!user) {
    return next(new ErrorHandler("User with this username not found", 404));
  }

  const isMatch = user.comparepassword(req.body.password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid Password!", 500));
  }

  res.status(200).json(user);
});

exports.logoutuser = catchAsyncError(async (req, res, next) => {});
