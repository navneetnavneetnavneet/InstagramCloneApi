const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controllers");
const { body } = require("express-validator");

// POST /users/signup
router.post(
  "/signup",
  [
    body("fullName").notEmpty().withMessage("Full name is required !"),
    body("username").notEmpty().withMessage("Username is required !"),
    body("email").isEmail().withMessage("Invalid email !"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be 6 characters !"),
    body("password")
      .isLength({ max: 15 })
      .withMessage("Password should not be excees 15 characters !"),
  ],
  userController.signUpUser
);

// POST /users/signin
router.post(
  "/signin",
  [
    body("username").notEmpty().withMessage("Username is required !"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be 6 characters !"),
    body("password")
      .isLength({ max: 15 })
      .withMessage("Password should not be excees 15 characters !"),
  ],
  userController.signInUser
);

// GET /users/signout
router.get(
  "/signout",
  authMiddleware.isAuthenticated,
  userController.signOutUser
);

// POST /users
router.get(
  "/current-user",
  authMiddleware.isAuthenticated,
  userController.loggedInUser
);

// POST /users/send-email
router.post(
  "/send-email",
  [body("email").isEmail().withMessage("Invalid email !")],
  userController.sendEmailUser
);

// GET /users/forget-password/:userId
router.post(
  "/forget-password-link/:userId",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be 6 characters !"),
    body("password")
      .isLength({ max: 15 })
      .withMessage("Password should not be excees 15 characters !"),
  ],
  userController.userForgetPassword
);

// POST /users/reset-password
// router.post("/users/reset-password", authMiddleware.isAuthenticated, userresetpassword);

// POST /users/edit/
router.post(
  "/edit",
  authMiddleware.isAuthenticated,
  userController.editUserProfile
);

// POST /users/search/username
router.get(
  "/search/:username",
  authMiddleware.isAuthenticated,
  userController.searchUser
);

// GET /users/profile/username
router.get(
  "/profile/:username",
  authMiddleware.isAuthenticated,
  userController.findUserProfile
);

// GET /users/follow/:userId
router.get(
  "/follow/:userId",
  authMiddleware.isAuthenticated,
  userController.followAndfollowing
);

// findUser details

// GET /users/post/:userId
router.get(
  "/post/:userId",
  authMiddleware.isAuthenticated,
  userController.findUserPost
);

// GET /users/savepost/:userId
router.get(
  "/savepost/:userId",
  authMiddleware.isAuthenticated,
  userController.findUserSavePost
);

// GET /users/chat/alluser
router.get("/", authMiddleware.isAuthenticated, userController.fetchAllUser);

// GET /users/chat/:userId
router.get(
  "/:userId",
  authMiddleware.isAuthenticated,
  userController.chatUser
);

module.exports = router;
