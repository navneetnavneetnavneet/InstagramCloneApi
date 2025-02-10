const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controllers");
const authMiddleware = require("../middlewares/auth.middleware");
const { body } = require("express-validator");

// POST /chats/access-chat
router.post(
  "/access-chat",
  [body("userId", "User Id is required !").isMongoId()],
  authMiddleware.isAuthenticated,
  chatController.accessChat
);

// GET /chats
router.get("/", authMiddleware.isAuthenticated, chatController.fetchChats);

// POST /chats/create-group
router.post(
  "/create-group",
  [
    body("chatName").notEmpty().withMessage("chatName is required !"),
    body("users")
      .isLength({ min: 2 })
      .withMessage("More than 2 users are required in group chat !"),
  ],
  authMiddleware.isAuthenticated,
  chatController.createGroupChat
);

module.exports = router;
