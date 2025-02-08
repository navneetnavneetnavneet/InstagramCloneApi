const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const postController = require("../controllers/post.controllers");
const { body } = require("express-validator");

// GET /posts
router.get("/", authMiddleware.isAuthenticated, postController.fetchAllPost);

// POST /posts/upload-post
router.post(
  "/upload-post",
  [
    body("caption").notEmpty().withMessage("Caption is required !"),
  ],
  authMiddleware.isAuthenticated,
  postController.uploadPost
);

// GET /posts/like-post/:postId
router.get(
  "/like-post/:postId",
  authMiddleware.isAuthenticated,
  postController.likePost
);

// GET /posts/save-post/:postId
router.get(
  "/save-post/:postId",
  authMiddleware.isAuthenticated,
  postController.savePost
);

// GET/posts/delete-post/:postID
router.get(
  "/delete-post/:postId",
  authMiddleware.isAuthenticated,
  postController.deletePost
);

// POST /posts/comment-post/:postId
router.post(
  "/comment-post/:postId",
  [body("comment").notEmpty().withMessage("Comment is required !")],
  authMiddleware.isAuthenticated,
  postController.sendComment
);

module.exports = router;
