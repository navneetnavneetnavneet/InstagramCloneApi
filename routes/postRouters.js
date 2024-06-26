const express = require("express");
const router = express.Router();
const {
  uploadpost,
  likepost,
  savepost,
} = require("../controllers/postControllers");
const { isAuthenticated } = require("../middlewares/auth");

// POST /post/upload
router.post("/upload", isAuthenticated, uploadpost);

// GET /post/like/:postId
router.get("/like/:id", isAuthenticated, likepost);

// GET /post/save/:postId
router.get("/save/:id", isAuthenticated, savepost);



module.exports = router;
