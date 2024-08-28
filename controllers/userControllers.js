const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendmail } = require("../utils/SendMail");
const { sendtoken } = require("../utils/SendToken");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const imagekit = require("../utils/ImageKit").initImageKit();

module.exports.registeruser = catchAsyncError(async (req, res, next) => {
  const user = await new User(req.body).save();

  sendtoken(user, 201, res);
});

module.exports.loggedInUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id).populate("posts");
  res.json(user);
});

module.exports.loginuser = catchAsyncError(async (req, res, next) => {
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

module.exports.logoutuser = catchAsyncError(async (req, res, next) => {
  res.clearCookie("token");

  res.json({ message: "Logout Successfully" });
});

module.exports.sendmailuser = catchAsyncError(async (req, res, next) => {
  console.log(req.body.email);
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

module.exports.userforgetpassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  console.log(req.body);
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

module.exports.userresetpassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);

  user.password = req.body.password;
  await user.save();

  sendtoken(user, 200, res);
});

module.exports.edituser = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.id, req.body, { new: true });

  if (!user) {
    return next(new ErrorHandler("Please login to access the resource", 404));
  }
  if (req.files) {
    // old file delete code
    if (user.profileImage.fileId !== "") {
      await imagekit.deleteFile(user.profileImage.fileId);
    }

    const file = req.files.profileImage;
    const modifiedFileName = uuidv4() + path.extname(file.name);

    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedFileName,
    });

    user.profileImage = { fileId, url };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "User Updated Successfully",
    user,
  });
});

module.exports.searchuser = catchAsyncError(async (req, res, next) => {
  const regex = new RegExp("^" + req.params.username, "i");
  const users = await User.find({ username: regex });

  if (!users) return next();

  res.status(200).json({ users });
});

module.exports.finduserprofile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  if (user.username === req.params.username) {
    res.status(200).json({
      user,
    });
  }

  const finduser = await User.findOne({
    username: req.params.username,
  }).populate("posts");

  if (!finduser) {
    return next(new ErrorHandler("findUser not found with this username", 404));
  }

  res.status(200).json({
    finduser,
  });
});

module.exports.followAndfollowing = catchAsyncError(async (req, res, next) => {
  const followKarneWalaUser = await User.findById(req.id); // loggedIn User
  const followHoneWalaUser = await User.findById(req.params.id); // opposite User

  if (followKarneWalaUser.followings.indexOf(followHoneWalaUser._id) === -1) {
    followKarneWalaUser.followings.push(followHoneWalaUser._id);

    followHoneWalaUser.followers.push(followKarneWalaUser._id);
  } else {
    followKarneWalaUser.followings.splice(
      followKarneWalaUser.followings.indexOf(followHoneWalaUser._id),
      1
    );

    followHoneWalaUser.followers.splice(
      followHoneWalaUser.followers.indexOf(followKarneWalaUser._id),
      1
    );
  }

  await followKarneWalaUser.save();
  await followHoneWalaUser.save();

  res.status(200).json({
    success: true,
    message: "User Follow and Following Successfully",
    loggedInUser: followKarneWalaUser,
    oppositeUser: followHoneWalaUser,
  });
});

// finduser

module.exports.findUserPost = catchAsyncError(async (req, res, next) => {
  const finduser = await User.findById(req.params.id).populate({
    path: "posts",
    populate: {
      path: "user",
    },
  });

  if (!finduser) {
    return next(new ErrorHandler("User Not Found !", 404));
  }

  res.status(200).json({ finduser });
});

module.exports.findUserSavePost = catchAsyncError(async (req, res, next) => {
  const finduser = await User.findById(req.params.id).populate("savePosts");

  if (!finduser) {
    return next(new ErrorHandler("User Not Found !", 404));
  }
  res.status(200).json({ finduser });
});

// get all users
module.exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  const allUser = await User.find({ _id: { $nin: [user._id] } });
  res.status(200).json(allUser);
});

// get chat user
module.exports.chatUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User Not Found !", 404));
  }
  res.status(200).json(user);
});
