const { catchAsyncError } = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Comment = require("../models/commentModel");
const imagekit = require("../utils/ImageKit").initImageKit();

module.exports.getallposts = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  const posts = await Post.find()
    .populate({
      path: "user",
    })
    .populate({
      path: "comments",
      populate: {
        path: "users",
      },
    });
  // console.log(posts);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  if (!posts) {
    return next(new ErrorHandler("All Post not found !", 404));
  }
  // console.log(posts.length)
  res.json({ message: "All Posts", posts, user });
});

// exports.uploadpost = catchAsyncError(async (req, res, next) => {
//module. const user = await User.findById(req.id);
// const post = await new Post(req.body).save();
// if (req.files) {
//   const file = req.files.image;
//   const modifiedFileName = uuidv4() + path.extname(file.name);
//   const { fileId, url } = await imagekit.upload({
//     file: file.data,
//     fileName: modifiedFileName,
//   });
//   post.image = { fileId, url };
// }
// post.user = user._id;
// user.posts.push(post._id);
// await post.save();
// await user.save();
// res.status(201).json({
//   success: true,
//   message: "Post Uploaded Successfully",
//   post,
// });
// });

module.exports.uploadpost = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  const validMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp", // Images
    "image/gif", // GIFs
    "video/mp4",
    "video/mkv",
    "video/webm", // Videos
  ];

  if (!validMimeTypes.includes(req.files?.image.mimetype)) {
    return next(
      new ErrorHandler(
        "Invalid file type. Only JPEG, PNG, JPG, WEBP, GIF, MP4, MKV, and WEBM files are allowed.",
        500
      )
    );
  }

  const maxImageSize = 5 * 1024 * 1024; // 5MB for images
  const maxVideoSize = 10 * 1024 * 1024; // 10MB for videos and GIFs

  if (
    (req.files?.image.mimetype.startsWith("image/") &&
      req.files?.image.size > maxImageSize) ||
    (req.files?.image.mimetype.startsWith("video/") &&
      req.files?.image.size > maxVideoSize)
  ) {
    return next(
      new ErrorHandler(
        `File size exceeds the limit. Max size: ${
          req.files?.image.mimetype.startsWith("image/") ? "2MB" : "20MB"
        }.`,
        500
      )
    );
  }

  const file = req.files.image;
  const modifiedFileName = uuidv4() + path.extname(file.name);

  const { fileId, url } = await imagekit.upload({
    file: file.data,
    fileName: modifiedFileName,
  });

  const post = new Post({
    image: { fileId, url },
    caption: req.body.caption,
    user: user._id,
  });
  user.posts.push(post._id);
  await post.save();
  await user.save();

  res.status(201).json({
    success: true,
    message: "Post Uploaded Successfully",
    post,
  });
});

module.exports.likepost = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  const post = await Post.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  if (!post) {
    return next(new ErrorHandler("Post not found !", 404));
  }

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

module.exports.savepost = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  const post = await Post.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  if (!post) {
    return next(new ErrorHandler("Post not found !", 404));
  }

  let message;
  if (user.savePosts.indexOf(post._id) === -1) {
    user.savePosts.push(post._id);
    message = "Post Saved Successfully";
  } else {
    user.savePosts.splice(user.savePosts.indexOf(post._id), 1);
    message = "Post unSaved Successfully";
  }
  await user.save();
  res.status(200).json({
    success: true,
    message,
    user,
  });
});

module.exports.deletepost = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  const post = await Post.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  if (!post) {
    return next(new ErrorHandler("Post not found !", 404));
  }

  user.posts.splice(user.posts.indexOf(post._id), 1);
  await user.save();
  res.json({
    success: true,
    message: "Post Deleted Successfully",
    user,
  });
});

module.exports.sendcomment = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  const post = await Post.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  if (!post) {
    return next(new ErrorHandler("Post not found !", 404));
  }

  const comment = await new Comment(req.body).save();

  if (!comment) {
    return next(new ErrorHandler("Error for comment is not created !", 404));
  }

  comment.post = post._id;
  comment.users.push(user._id);
  post.comments.push(comment._id);

  await post.save();
  await comment.save();

  res.status(200).json({
    success: true,
    message: "Send Comment Seccessfully",
    comment,
    post,
  });
});
