const express = require("express");
const router = express.Router();
const {
  homepage,
  loggedInUser,
  registeruser,
  loginuser,
  logoutuser,
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../middlewares/auth");

// GET /
router.get("/", isAuthenticated, homepage);

// POST /user
router.post("/user", isAuthenticated, loggedInUser);

// POST /user/register
router.post("/user/register", registeruser);

// POST /user/login
router.post("/user/login", loginuser);

// GET /user/logout
router.get("/user/logout", isAuthenticated, logoutuser);

module.exports = router;
