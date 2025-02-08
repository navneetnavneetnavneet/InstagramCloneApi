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

module.exports = router;