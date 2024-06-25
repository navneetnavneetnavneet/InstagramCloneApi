const express = require("express");
const router = express.Router();
const { uploadpost } = require("../controllers/postControllers");
const { isAuthenticated } = require("../middlewares/auth");

// POST /post/upload
router.post("/upload", isAuthenticated, uploadpost);

module.exports = router;
