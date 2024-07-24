const express = require("express");
const router = express.Router();
const {
  getallposts,
  uploadpost,
  likepost,
  savepost,
  deletepost,
  sendcomment,
} = require("../controllers/postControllers");
const { isAuthenticated } = require("../middlewares/auth");

// GET /
router.get("/", isAuthenticated, getallposts);

// POST /post/upload
router.post("/upload", isAuthenticated, uploadpost);

// GET /post/like/:postId
router.get("/like/:id", isAuthenticated, likepost);

// GET /post/save/:postId
router.get("/save/:id", isAuthenticated, savepost);

// GET/post/delete/:postID
router.get("/delete/:id", isAuthenticated, deletepost);

// POST /post/comment/:postId
router.post("/comment/:id", isAuthenticated, sendcomment);

module.exports = router;
