const {
  catchAsyncError,
} = require("../middlewares/catchAsyncError.middleware");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendEmail } = require("../utils/SendMail");
const { sendToken } = require("../utils/SendToken");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { validationResult } = require("express-validator");
const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklistToken.model");
const imagekit = require("../config/imagekit.config").initImageKit();

module.exports.signUpUser = catchAsyncError(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, username, email, password } = req.body;

  const isUserAlreadyExisted = await userModel.findOne({ email });

  if (isUserAlreadyExisted) {
    return next(new ErrorHandler("User already existed, Please login !", 400));
  }

  const user = await userModel.create({ fullName, username, email, password });

  sendToken(user, 201, res);
});

module.exports.signInUser = catchAsyncError(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  const user = await userModel.findOne({ username }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid username or password!", 401));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid username or password!", 401));
  }

  sendToken(user, 200, res);
});

module.exports.signOutUser = catchAsyncError(async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  await blacklistTokenModel.create({ token });

  res.clearCookie("token");

  res.status(200).json({ message: "User Logout Successfully" });
});

module.exports.loggedInUser = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id).populate("posts");
  res.status(200).json(user);
});

module.exports.sendEmailUser = catchAsyncError(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  const url = `${req.protocol}://${req.get(
    "host"
  )}/users/forget-password-link/${user._id}`;

  sendEmail(req, res, next, url);
  user.resetPasswordToken = "1";
  await user.save();

  res.status(200).json({ user, url });
});

module.exports.userForgetPassword = catchAsyncError(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user = await userModel.findById(req.params.userId);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  if (user.resetPasswordToken === "1") {
    user.resetPasswordToken = "0";
    user.password = req.body.password;
  } else {
    return next(
      new ErrorHandler("Invalid Password Reset Link! Please try again", 500)
    );
  }
  await user.save();

  res.status(200).json(user);
});

module.exports.userresetpassword = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);

  user.password = req.body.password;
  await user.save();

  sendToken(user, 200, res);
});

module.exports.editUserProfile = catchAsyncError(async (req, res, next) => {
  const { fullName, username, email, bio, profileImage } = req.body;

  const user = await userModel.findByIdAndUpdate(
    req._id,
    { fullName, username, email, profileImage, bio },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ErrorHandler("Please login to access the resource", 404));
  }
  if (req.files) {
    const file = req.files.profileImage;
    const modifiedFileName = uuidv4() + path.extname(file.name);
    const mimeType = file.mimetype?.split("/")[0];

    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!validMimeTypes.includes(file.mimetype)) {
      return next(
        new ErrorHandler(
          "Invalid file type. Only JPEG, PNG, JPG and WEBP files are allowed.",
          400
        )
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      return next(
        new ErrorHandler(
          "File size exceeds the 5MB limit, Please select another file !",
          400
        )
      );
    }

    // old file delete code
    try {
      if (user.profileImage.fileId !== "") {
        await imagekit.deleteFile(user.profileImage.fileId);
      }
    } catch (error) {
      console.error("Failed to delete old profile image:", error);
    }

    try {
      const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
      });

      user.profileImage = { fileId, url, fileType: mimeType };
    } catch (error) {
      return next(
        new ErrorHandler("Failed to upload image on imagekit !", 500)
      );
    }
  }

  await user.save();

  res.status(200).json(user);
});

module.exports.searchUser = catchAsyncError(async (req, res, next) => {
  const regex = new RegExp("^" + req.params.username, "i");
  const users = await userModel.find({ username: regex });

  res.status(200).json(users);
});

module.exports.findUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);
  if (user.username === req.params.username) {
    res.status(200).json(user);
  }

  const findUser = await userModel
    .findOne({
      username: req.params.username,
    })
    .populate("posts");

  if (!findUser) {
    return next(new ErrorHandler("User not found !", 404));
  }

  res.status(200).json(findUser);
});

module.exports.followAndfollowing = catchAsyncError(async (req, res, next) => {
  const followKarneWalaUser = await userModel.findById(req._id); // loggedIn User
  const followHoneWalaUser = await userModel.findById(req.params.userId); // opposite User

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

// finduser post
module.exports.findUserPost = catchAsyncError(async (req, res, next) => {
  const findUser = await userModel.findById(req.params.userId).populate({
    path: "posts",
    populate: {
      path: "user",
    },
  });

  if (!findUser) {
    return next(new ErrorHandler("User Not Found !", 404));
  }

  res.status(200).json(findUser);
});

// finduser savepost
module.exports.findUserSavePost = catchAsyncError(async (req, res, next) => {
  const findUser = await userModel
    .findById(req.params.userId)
    .populate("savePosts");

  if (!findUser) {
    return next(new ErrorHandler("User Not Found !", 404));
  }
  res.status(200).json(findUser);
});

// fetch alluser
module.exports.fetchAllUser = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);
  const allUser = await userModel.find({ _id: { $nin: [user._id] } });
  res.status(200).json(allUser);
});

// get chat user
module.exports.chatUser = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.params.userId);
  if (!user) {
    return next(new ErrorHandler("User Not Found !", 404));
  }
  res.status(200).json(user);
});
