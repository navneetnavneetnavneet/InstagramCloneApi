const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const {
  uploadStory,
  getAllStories,
} = require("../controllers/storyControllers");

// POST /story/upload-story
router.post("/upload-story", isAuthenticated, uploadStory);

// GET /story
router.get("/", isAuthenticated, getAllStories);

module.exports = router;
