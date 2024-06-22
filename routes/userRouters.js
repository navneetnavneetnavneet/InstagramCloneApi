const express = require("express");
const router = express.Router();
const {
  homepage,
  registeruser,
  loginuser,
  logoutuser,
} = require("../controllers/userControllers");

// GET /
router.get("/", homepage);

// POST /user/register
router.post("/user/register", registeruser);

// POST /user/login
router.post("/user/login", loginuser);

// GET /user/logout
router.post("/user/logout", logoutuser);

module.exports = router;
