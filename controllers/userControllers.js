const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendmail } = require("../utils/SendMail");
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

exports.sendmailuser = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorHandler("User not found with this email address !", 404)
    );
  }

  const url = `${req.protocol}://${req.get("host")}/user/forget-password-link/${
    user._id
  }`;

  sendmail(req, res, next, url);
  user.resetPasswordToken = "1";
  await user.save();

  res.json({ user, url });
});

exports.userforgetpassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler("User not found with this email address !", 404)
    );
  }

  if (user.resetPasswordToken === "1") {
    user.resetPasswordToken = "0";
    user.password = req.body.password;
    await user.save();
  } else {
    return next(
      new ErrorHandler("Invalid Password Reset Link! Please try again", 500)
    );
  }

  res.json({ message: "Password Changed Successfully" });
});

exports.userresetpassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);

  user.password = req.body.password;
  await user.save();

  sendtoken(user, 200, res);
});

exports.edituser = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.id, req.body, { new: true });

  res.status(200).json({
    success: true,
    message: "User Updated Successfully",
    // user
  });
});
