const express = require("express");
const router = express.Router();
const {
  loggedInUser,
  registeruser,
  loginuser,
  logoutuser,
  sendmailuser,
  userforgetpassword,
  userresetpassword,
  edituser,
  searchuser,
  finduserprofile,
  followAndfollowing
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../middlewares/auth");

// POST /user
router.post("/user", isAuthenticated, loggedInUser);

// POST /user/register
router.post("/user/register", registeruser);

// POST /user/login
router.post("/user/login", loginuser);

// GET /user/logout
router.get("/user/logout", isAuthenticated, logoutuser);

// POST /user/send-mail
router.post("/user/send-mail", sendmailuser);

// GET /user/forget-password/:userId
router.get("/user/forget-password-link/:id", userforgetpassword);

// POST /user/reset-password
// router.post("/user/reset-password", isAuthenticated, userresetpassword);

// POST /user/edit/
router.post("/user/edit", isAuthenticated, edituser);

// POST /user/search/username
router.post("/user/search/:username", isAuthenticated, searchuser);

// GET /user/profile/username
router.get("/user/profile/:username", isAuthenticated, finduserprofile);

// GET /user/follow/:userId
router.get("/user/follow/:id", isAuthenticated, followAndfollowing);

module.exports = router;
