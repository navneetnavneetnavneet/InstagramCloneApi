const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const storyController = require("../controllers/story.controllers");

// POST /stories/upload-story
router.post(
  "/upload-story",
  authMiddleware.isAuthenticated,
  storyController.uploadStory
);

// GET /stories
router.get(
  "/",
  authMiddleware.isAuthenticated,
  storyController.fetchAllStories
);

// GET /stories/like/:storyId
router.get(
  "/like/:storyId",
  authMiddleware.isAuthenticated,
  storyController.likeStory
);

// GET /stories/delete/:storyId
router.get(
  "/delete/:storyId",
  authMiddleware.isAuthenticated,
  storyController.deleteStory
);

module.exports = router;
