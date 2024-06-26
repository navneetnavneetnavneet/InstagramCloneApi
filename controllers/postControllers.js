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

exports.likepost = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  const post = await Post.findById(req.params.id);

  let message;
  if (post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
    message = "Post Liked Successfully";
  } else {
    post.likes.splice(post.likes.indexOf(user._id), 1);
    message = "Post disLiked Successfully";
  }
  await post.save();

  res.status(200).json({
    success: true,
    message,
    post,
  });
});

exports.savepost = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  const post = await Post.findById(req.params.id);

  if (user.savePosts.indexOf(post._id) === -1) {
    user.savePosts.push(post._id);
  } else {
    user.savePosts.splice(user.savePosts.indexOf(), 1);
  }
  await user.save();
  res.json(user);
});
