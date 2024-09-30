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

// Middleware to remove the story from the user's stories array when it expires
storySchema.post("remove", async function (dets) {
  console.log(dets);

  await mongoose.model("user").findByIdAndUpdate(dets.user, {
    $pull: { stories: dets._id },
  });
});

module.exports = mongoose.model("story", storySchema);
