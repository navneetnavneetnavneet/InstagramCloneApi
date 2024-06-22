const express = require("express");
const router = express.Router();
const { homepage, registeruser } = require("../controllers/userControllers");

// GET /
router.get("/", homepage);

// POST /user/register
router.post("/user/register", registeruser);

module.exports = router;
