const jwt = require("jsonwebtoken");
const { catchAsyncError } = require("./catchAsyncError.middleware");
const ErrorHandler = require("../utils/ErrorHandler");
const blacklistTokenModel = require("../models/blacklistToken.model");
const userModel = require("../models/user.model");

module.exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ErrorHandler("Unauthorized !", 401));
  }

  const isBlacklistedToken = await blacklistTokenModel.findOne({ token });

  if (isBlacklistedToken) {
    return next(new ErrorHandler("Unauthorized !", 401));
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id);
    req._id = user;

    return next();
  } catch (error) {
    return next(new ErrorHandler("Unauthorized !", 401));
  }
});
