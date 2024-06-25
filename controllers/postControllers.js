const { catchAsyncError } = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const imagekit = require("../utils/ImageKit").initImageKit();

exports.uploadpost = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  const post = await new Post(req.body).save();

  if (req.files) {
    const file = req.files.image;
    const modifiedFileName = uuidv4() + path.extname(file.name);

    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedFileName,
    });

    post.image = { fileId, url };
  }
  user.posts.push(post._id);

  await post.save();
  await user.save();

  res.status(201).json({
    success: true,
    message: "Post Uploaded Successfully",
    post,
  });
});


