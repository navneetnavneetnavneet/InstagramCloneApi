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
  if (req.files) {
    const file = req.files?.storyUrl;
    const modifiedFileName = uuidv4() + path.extname(file.name);

    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedFileName,
    });

    const story = await Story.create({
      storyUrl: { fileId, url },
      user: user._id,
    });

    if (story) {
      user.stories.push(story._id);
      await user.save();
    } else {
      return next(new ErrorHandler("Internal Server Error !", 500));
    }
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
    }
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

  res.status(200).json({ stories: filteredStories, user });
});
