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

module.exports.fetchChats = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req._id);

  if (!user) {
    return next(new ErrorHandler("User not found !", 404));
  }

  await chatModel
    .find({ users: { $elemMatch: { $eq: req._id } } })
    .populate("users")
    .populate("groupAdmin")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      // Adding the admin to the start of the chat.users array
      results.forEach((chat) => {
        if (chat.isGroupChat && chat.groupAdmin) {
          const adminIndex = chat.users.findIndex(
            (u) => u._id.toString() === chat.groupAdmin._id.toString()
          );

          const [adminUser] = chat.users.splice(adminIndex, 1);
          chat.users.unshift(adminUser);
        }

        // Adding the loggedInUser to the start of the chat.users array
        const loggedInUserIndex = chat.users.findIndex(
          (u) => u._id.toString() === user._id.toString()
        );

        const [loggedInUser] = chat.users.splice(loggedInUserIndex, 1);
        chat.users.unshift(loggedInUser);
      });

      results = await userModel.populate(results, {
        path: "latestMessage.senderId",
      });

      res.status(200).json(results);
    });
});

module.exports.createGroupChat = catchAsyncError(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const users = JSON.parse(req.body.users);

  // Adding the loggedInUser to the start of the users array
  users.unshift(req._id);

  const isGroup = await chatModel.findOne({ chatName: req.body.chatName });

  if (isGroup) {
    return next(
      new ErrorHandler("Group chat already exists with this chatName !", 400)
    );
  }

  try {
    const createdGroupChat = await chatModel.create({
      chatName: req.body.chatName,
      isGroupChat: true,
      users: users,
      groupAdmin: req._id,
    });

    const fullGroupChat = await chatModel
      .findById(createdGroupChat._id)
      .populate("users")
      .populate("groupAdmin");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    return next(new ErrorHandler("Group chat is not created !", 500));
  }
});

module.exports.renameGroupChat = catchAsyncError(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { chatId, chatName } = req.body;

  try {
    const updatedGroupChat = await chatModel
      .findByIdAndUpdate(chatId, { chatName }, { new: true })
      .populate("users")
      .populate("groupAdmin");

    res.status(200).json(updatedGroupChat);
  } catch (error) {
    return next(new ErrorHandler("Group chat is not renamed !", 500));
  }
});

module.exports.addUserToGroupChat = catchAsyncError(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { chatId, userId } = req.body;

  const groupChat = await chatModel.findById(chatId);

  if (groupChat.users.includes(userId)) {
    return next(new ErrorHandler("User already exists in group chat!", 400));
  }

  try {
    const groupChat = await chatModel
      .findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
      .populate("users")
      .populate("groupAdmin");

    res.status(200).json(groupChat);
  } catch (error) {
    return next(new ErrorHandler("User is not added in group chat !", 500));
  }
});

module.exports.removeUserFromGroupChat = catchAsyncError(
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chatId, userId } = req.body;

    const groupChat = await chatModel.findById(chatId);

    if (!groupChat.users.includes(userId)) {
      return next(new ErrorHandler("User not found in group chat !", 400));
    }

    try {
      const groupChat = await chatModel
        .findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
        .populate("users")
        .populate("groupAdmin");

      res.status(200).json(groupChat);
    } catch (error) {
      return next(new ErrorHandler("User is not removed in group chat !", 500));
    }
  }
);

module.exports.exitUserFromGroupChat = catchAsyncError(
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chatId } = req.body;

    const user = await userModel.findById(req._id);
    const chat = await chatModel
      .findById(chatId)
      .populate("users")
      .populate("groupAdmin");

    if (!chat) {
      return next(new ErrorHandler("Group chat is not found !", 404));
    }

    // Check if the user exists in the chat
    const userExists = chat.users.find(
      (u) => u._id.toString() === user._id.toString()
    );

    if (!userExists) {
      return next(new ErrorHandler("User not found in group chat !", 404));
    }

    chat.users = chat.users.filter(
      (u) => u._id.toString() !== user._id.toString()
    );

    if (chat.groupAdmin._id.toString() === user._id.toString()) {
      chat.groupAdmin = chat.users[0] || null;
    }

    await chat.save();

    res.status(200).json(chat);
  }
);
