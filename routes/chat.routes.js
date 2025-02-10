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

// POST /chats/rename-group
router.post(
  "/rename-group",
  [
    body("chatId", "Chat Id is required !").isMongoId(),
    body("chatName").notEmpty().withMessage("chatName is required !"),
  ],
  authMiddleware.isAuthenticated,
  chatController.renameGroupChat
);

// POST /chats/add-user-group
router.post(
  "/add-user-group",
  [
    body("chatId", "Chat Id is required !").isMongoId(),
    body("userId", "User Id is required !").isMongoId(),
  ],
  authMiddleware.isAuthenticated,
  chatController.addUserToGroupChat
);

// POST /chats/remove-user-group
router.post(
  "/remove-user-group",
  [
    body("chatId", "Chat Id is required !").isMongoId(),
    body("userId", "User Id is required !").isMongoId(),
  ],
  authMiddleware.isAuthenticated,
  chatController.removeUserFromGroupChat
);

// POST /chats/exit-user-group
router.post(
  "/exit-user-group",
  [body("chatId", "Chat Id is required !").isMongoId()],
  authMiddleware.isAuthenticated,
  chatController.exitUserFromGroupChat
);

module.exports = router;
