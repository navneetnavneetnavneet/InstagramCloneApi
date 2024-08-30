const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const {
  sendMessage,
  getAllMessages,
} = require("../controllers/messageControllers");
const router = express.Router();

// POST /chat/sendmessage/:userId
router.post("/sendmessage/:id", isAuthenticated, sendMessage);

// GET /chat/:userId
router.get("/:id", isAuthenticated, getAllMessages);

module.exports = router;
