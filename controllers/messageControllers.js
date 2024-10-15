const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const ErrorHandler = require(".././utils/ErrorHandler");
const { getReceiverSocketId, io } = require("../socket/socket");
const imagekit = require(".././utils/ImageKit").initImageKit();
const path = require("path");
const { v4: uuidv4 } = require("uuid");

module.exports.sendMessage = catchAsyncError(async (req, res, next) => {
  const senderId = req.id;
  const receiverId = req.params.id;
  const { message } = req.body;

  let getConversation = await Conversation.findOne({
    participaints: { $all: [senderId, receiverId] },
  });

  if (!getConversation) {
    getConversation = await Conversation.create({
      participaints: [senderId, receiverId],
    });
  }

  if (!message && !req.files) {
    return next(new ErrorHandler("Please send message or media file !", 500));
  }

  // send new message
  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  if (req.files) {
    const mimeType = req.files?.media?.mimetype.split("/")[0];

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

      // Text file MIME types
      "text/plain",
    ];

    if (!validMimeTypes.includes(req.files?.media.mimetype)) {
      return next(
        new ErrorHandler("Invalid file type. This file is not allowed.", 500)
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB for images and videos

    if (req.files?.media?.size > maxSize) {
      return next(
        new ErrorHandler(
          "File size exceeds the 10MB limit, Please select another file !",
          500
        )
      );
    }

    const file = req.files?.media;
    const modifiedFileName = uuidv4() + path.extname(file.name);

    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedFileName,
    });

    if (newMessage && fileId && url && mimeType) {
      newMessage.media = { fileId, url, fileType: mimeType };
    }
  }

  if (newMessage) {
    getConversation.messages.push(newMessage._id);
  }

  // await getConversation.save();
  await Promise.all([getConversation.save(), newMessage.save()]);

  // socket.io
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  return res.status(200).json({
    success: true,
    message: "Send Message Successfully",
    newMessage,
  });
});

module.exports.getAllMessages = catchAsyncError(async (req, res, next) => {
  const senderId = req.id;
  const receiverId = req.params.id;

  const conversation = await Conversation.findOne({
    participaints: { $all: [senderId, receiverId] },
  }).populate("messages");

  return res.status(200).json(conversation?.messages);
});
