const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

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

  // send new message
  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  if (newMessage) {
    getConversation.messages.push(newMessage._id);
  }

  // await getConversation.save();
  await Promise.all([getConversation.save(), newMessage.save()]);

  // socket.io

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
