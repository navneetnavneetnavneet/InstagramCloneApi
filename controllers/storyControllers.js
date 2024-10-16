const { catchAsyncError } = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/userModel");
const Story = require("../models/storyModel");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const imagekit = require("../utils/ImageKit").initImageKit();

module.exports.uploadStory = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  if (!user) {
    return next(new ErrorHandler("User Not Found !", 404));
  }

  if (!req.files) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }

  if (req.files) {
    const mimeType = req.files?.storyUrl?.mimetype?.split("/")[0];

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

    if (!validMimeTypes.includes(req.files?.storyUrl.mimetype)) {
      return next(
        new ErrorHandler("Invalid file type. This file is not allowed.", 500)
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB for images and videos

    if (req.files?.storyUrl?.size > maxSize) {
      return next(
        new ErrorHandler(
          "File size exceeds the 10MB limit, Please select another file !",
          500
        )
      );
    }

    const file = req.files?.storyUrl;
    const modifiedFileName = uuidv4() + path.extname(file.name);

    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedFileName,
    });

    const story = await Story.create({
      storyUrl: { fileId, url, fileType: mimeType },
      user: user._id,
    });

    if (!story) {
      return next(new ErrorHandler("Internal Server Error !", 500));
    }

    user.stories.push(story._id);
    await user.save();
  }

  res.status(200).json({
    message: "Story Uploaded Successfully",
    user,
  });
});

module.exports.getAllStories = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  if (!user) {
    return next(new ErrorHandler("User Not Found !", 404));
  }

  const stories = await Story.find().populate({
    path: "user",
    populate: {
      path: "stories",
    },
  });
  // console.log(stories);

  const obj = {};
  const filteredStories = stories.filter((story) => {
    if (!obj[story.user?._id]) {
      obj[story.user?._id] = "kuchh bhi";
      return true;
    } else {
      return false;
    }
  });

  // loggedIn user story moved in first
  const loggedInUserStories = filteredStories.find(
    (story) => story.user._id.toString() === user._id.toString()
  );

  const otherUserStroies = filteredStories.filter(
    (story) => story.user._id.toString() !== user._id.toString()
  );

  if (loggedInUserStories) {
    otherUserStroies.unshift(loggedInUserStories);
  }

  res.status(200).json({ stories: otherUserStroies, user });
});

module.exports.likeStory = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  if (!user) {
    return next(new ErrorHandler("User Not Found !", 404));
  }

  const story = await Story.findById(req.params.id);
  if (!story) {
    return next(new ErrorHandler("Story Not Found !", 404));
  }

  let message;
  if (story.likes.indexOf(user._id) === -1) {
    story.likes.push(user._id);
    message = "Story liked successfully";
  } else {
    story.likes.splice(story.likes.indexOf(user._id), 1);
    message = "Story disLiked successfully";
  }
  await story.save();

  res.status(200).json({
    message,
    story,
  });
});

module.exports.deleteStory = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.id);
  if (!user) {
    return next(new ErrorHandler("User Not Found !", 404));
  }

  if (!user.stories.includes(req.params.id)) {
    return next(new ErrorHandler("Story Not Found !", 404));
  }

  user.stories.splice(user.stories.indexOf(req.params.id.toString()), 1);
  await Story.findOneAndDelete({ _id: req.params.id });
  await user.save();

  res.status(200).json({
    message: "Story delete successfully",
    user,
  });
});
