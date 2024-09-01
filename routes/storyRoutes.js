const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");
const { uploadStory } = require("../controllers/storyControllers");

// POST /story/upload-story
router.post("/upload-story", isAuthenticated, uploadStory);

module.exports = router;
