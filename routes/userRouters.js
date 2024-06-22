const express = require("express");
const router = express.Router();
const { homepage } = require("../controllers/userControllers");

router.get("/", homepage);

module.exports = router;
