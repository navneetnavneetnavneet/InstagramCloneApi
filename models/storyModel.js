const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  storyUrl: {
    type: Object,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 24 * 60 * 60 * 1000,
    index: { expires: "1d" },
  },
});

module.exports = mongoose.model("story", storySchema);
