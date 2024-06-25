const express = require("express");
const router = express.Router();
const { uploadpost, likepost } = require("../controllers/postControllers");
const { isAuthenticated } = require("../middlewares/auth");

// POST /post/upload
router.post("/upload", isAuthenticated, uploadpost);

// GET /post/like/:postId
router.get("/like/:id", isAuthenticated, likepost);

module.exports = router;
