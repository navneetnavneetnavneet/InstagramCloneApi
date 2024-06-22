const { catchAsyncError } = require("../middlewares/catchAsyncError");

exports.homepage = catchAsyncError((req, res, next) => {
  res.json({ message: "homepage" });
});
