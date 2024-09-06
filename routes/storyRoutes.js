const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const {
  uploadStory,
  getAllStories,
  likeStory,
  deleteStory,
} = require("../controllers/storyControllers");

// POST /story/upload-story
router.post("/upload-story", isAuthenticated, uploadStory);

// GET /story
router.get("/", isAuthenticated, getAllStories);

// GET /story/like/:storyId
router.get("/like/:id", isAuthenticated, likeStory);

// GET /story/like/:storyId
router.get("/delete/:id", isAuthenticated, deleteStory);

module.exports = router;
