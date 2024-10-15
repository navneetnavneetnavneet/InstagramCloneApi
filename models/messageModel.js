const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    message: {
      type: String,
      trim: true,
    },
    media: {
      type: Object,
      default: {
        fileId: "",
        url: "",
        fileType: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("message", messageSchema);
