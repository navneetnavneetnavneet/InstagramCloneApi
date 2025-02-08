const {
  catchAsyncError,
} = require("../middlewares/catchAsyncError.middleware");
const ErrorHandler = require("../utils/ErrorHandler");
const chatModel = require("../models/chat.model");
const userModel = require("../models/user.model");
const { validationResult } = require("express-validator");

module.exports.accessChat = catchAsyncError(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.body;

  var isChat = await chatModel
    .find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("users")
    .populate("latestMessage");

  isChat = await userModel.populate(isChat, {
    path: "latestMessage.senderId",
  });

  if (isChat.length > 0) {
    res.status(200).json(isChat[0]);
  } else {
    try {
      const createdChat = await chatModel.create({
        isGroupChat: false,
        users: [req._id, userId],
      });

      const fullChat = await chatModel
        .findById(createdChat._id)
        .populate("users");

      res.status(201).json(fullChat);
    } catch (error) {
      return next(new ErrorHandler("Chat is not created !", 500));
    }
  }
});


