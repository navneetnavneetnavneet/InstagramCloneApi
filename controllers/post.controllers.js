const {
  catchAsyncError,
} = require("../middlewares/catchAsyncError.middleware");
const ErrorHandler = require("../utils/ErrorHandler");
const userModel = require("../models/user.model");
const postModel = require("../models/post.model");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Comment = require("../models/comment.model");
const { validationResult } = require("express-validator");
const commentModel = require("../models/comment.model");
const imagekit = require("../config/imagekit.config.js").initImageKit();

module.exports.fetchAllPost = catchAsyncError(async (req, res, next) => {
  const posts = await postModel
    .find()
    .populate({
      path: "user",
    })
    .populate({
      path: "comments",
      populate: {
        path: "users",
      },
    });

  res.status(200).json(posts);
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

module.exports.uploadPost = catchAsyncError(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user = await userModel.findById(req._id);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  if (req.files) {
    const file = req.files.media;
    const modifiedFileName = uuidv4() + path.extname(file.name);
    const mimeType = file?.mimetype.split("/")[0];
    const validMimeTypes = [
      // Image MIME types
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/avif",

      // Video MIME types
      "video/mp4",
      "video/x-msvideo",
      "video/mpeg",
      "video/ogg",
      "video/webm",
      "video/3gpp",
    ];

    if (!validMimeTypes.includes(file.mimetype)) {
      return next(
        new ErrorHandler("Invalid file type. This file is not allowed.", 500)
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB for images and videos

    if (file.size > maxSize) {
      return next(
        new ErrorHandler(
          "File size exceeds the 10MB limit, Please select another file !",
          500
        )
      );
    }

    try {
      const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
      });

      const post = new postModel({
        media: { fileId, url, fileType: mimeType },
        caption: req.body.caption,
        user: user._id,
      });

      user.posts.push(post._id);
      await Promise.all([user.save(), post.save()]);

      res.status(201).json(post);
    } catch (error) {
      return next(
        new ErrorHandler("Media file is not uploaded on imagekit !", 500)
      );
    }
  } else {
    return next(new ErrorHandler("Media file is required !", 400));
  }
});

module.exports.likePost = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);
  const post = await postModel.findById(req.params.postId);

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

module.exports.savePost = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);
  const post = await postModel.findById(req.params.postId);

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

module.exports.deletePost = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);
  const post = await postModel.findByIdAndDelete(req.params.postId);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  if (!post) {
    return next(new ErrorHandler("Post not found !", 404));
  }

  user.posts.splice(user.posts.indexOf(post._id), 1);
  await user.save();
  res.status(200).json({
    success: true,
    message: "Post Deleted Successfully",
    user,
  });
});

module.exports.sendComment = catchAsyncError(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user = await userModel.findById(req._id);
  const post = await postModel.findById(req.params.postId);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  if (!post) {
    return next(new ErrorHandler("Post not found !", 404));
  }

  try {
    const comment = await commentModel.create({
      comment: req.body.comment,
      post: post._id,
    });

    comment.users.push(user._id);
    post.comments.push(comment._id);

    await Promise.all([post.save(), comment.save()]);

    res.status(200).json({
      success: true,
      message: "Send Comment Seccessfully",
      comment,
      post,
    });
  } catch (error) {
    return next(new ErrorHandler("Comment is not created !", 500));
  }
});
