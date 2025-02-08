const {
  catchAsyncError,
} = require("../middlewares/catchAsyncError.middleware");
const ErrorHandler = require("../utils/ErrorHandler");
const userModel = require("../models/user.model");
const storyModel = require("../models/story.model");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const imagekit = require("../config/imagekit.config").initImageKit();

module.exports.uploadStory = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);
  if (!user) {
    return next(new ErrorHandler("User Not Found !", 404));
  }

  if (req.files) {
    const file = req.files?.media;
    const modifiedFileName = uuidv4() + path.extname(file.name);
    const mimeType = file.mimetype?.split("/")[0];

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
        new ErrorHandler("Invalid file type. This file is not allowed.", 400)
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB for images and videos

    if (file.size > maxSize) {
      return next(
        new ErrorHandler(
          "File size exceeds the 10MB limit, Please select another file !",
          400
        )
      );
    }

    try {
      const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
      });

      const story = await storyModel.create({
        media: { fileId, url, fileType: mimeType },
        user: user._id,
      });

      user.stories.push(story._id);
      await user.save();

      res.status(201).json({
        message: "Story Uploaded Successfully",
        user,
      });
    } catch (error) {
      return next(new ErrorHandler("Error uploading file on imagekit !", 500));
    }
  } else {
    return next(new ErrorHandler("Please select a file to upload !", 500));
  }
});

module.exports.fetchAllStories = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);
  if (!user) {
    return next(new ErrorHandler("User Not Found !", 404));
  }

  const stories = await storyModel.find().populate({
    path: "user",
    populate: {
      path: "stories",
    },
  });
  // console.log(stories);

  const obj = {};
  const filteredStories = stories.filter((story) => {
    if (!obj[story.user?._id]) {
      obj[story.user?._id] = "anything";
      return true;
    } else {
      return false;
    }
  });

  // logic to show the logged in user's story first
  const loggedInUserStories = filteredStories.find(
    (story) => story.user._id.toString() === user._id.toString()
  );

  // logic to show other user's stories
  const otherUserStroies = filteredStories.filter(
    (story) => story.user._id.toString() !== user._id.toString()
  );

  if (loggedInUserStories) {
    otherUserStroies.unshift(loggedInUserStories);
  }

  res.status(200).json({ stories: otherUserStroies, user });
});

module.exports.likeStory = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);
  if (!user) {
    return next(new ErrorHandler("User Not Found !", 404));
  }

  const story = await storyModel.findById(req.params.storyId);
  if (!story) {
    return next(new ErrorHandler("Story Not Found !", 404));
  }

  if (story.likes.indexOf(user._id) === -1) {
    story.likes.push(user._id);
  } else {
    story.likes.splice(story.likes.indexOf(user._id), 1);
  }
  await story.save();

  res.status(200).json(story);
});

module.exports.deleteStory = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);
  if (!user) {
    return next(new ErrorHandler("User Not Found !", 404));
  }

  if (!user.stories.includes(req.params.storyId)) {
    return next(new ErrorHandler("Story Not Found !", 404));
  }

  user.stories.splice(user.stories.indexOf(req.params.storyId.toString()), 1);
  await storyModel.findOneAndDelete({ _id: req.params.storyId });
  await user.save();

  res.status(200).json({
    message: "Story delete successfully",
    user,
  });
});
