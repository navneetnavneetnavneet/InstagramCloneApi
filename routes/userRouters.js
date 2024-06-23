const express = require("express");
const router = express.Router();
const {
  homepage,
  loggedInUser,
  registeruser,
  loginuser,
  logoutuser,
  usersendmail,
  userforgetpassword,
  userresetpassword
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../middlewares/auth");

// GET /
router.get("/", homepage);

// POST /user
router.post("/user", isAuthenticated, loggedInUser);

// POST /user/register
router.post("/user/register", registeruser);

// POST /user/login
router.post("/user/login", loginuser);

// GET /user/logout
router.get("/user/logout", isAuthenticated, logoutuser);

// POST /user/send-mail
router.post("/user/send-mail", usersendmail);

// GET /user/forget-password/:userId
router.get("/user/forget-password-link/:id", userforgetpassword);

// POST /user/reset-password
// router.post("/user/reset-password", isAuthenticated, userresetpassword);

module.exports = router;
