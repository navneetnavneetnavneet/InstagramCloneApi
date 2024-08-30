const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    message: {
      type: String,
      required: [true, "Message is required !"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("message", messageSchema);
