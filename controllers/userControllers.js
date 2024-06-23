const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendtoken } = require("../utils/SendToken");

exports.homepage = catchAsyncError(async (req, res, next) => {
  res.json({ message: "secure homepage" });
});

exports.registeruser = catchAsyncError(async (req, res, next) => {
  const user = await new User(req.body).save();

  sendtoken(user, 201, res);
});

exports.loggedInUser = catchAsyncError(async (req, res, next) => {
  console.log(req);
  const user = await User.findById(req.id);

  res.json(user);
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

  sendtoken(user, 200, res);
});

exports.logoutuser = catchAsyncError(async (req, res, next) => {
  res.clearCookie("token");

  res.json({ message: "Logout Successfully" });
});
