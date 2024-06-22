require("dotenv").config({
  path: "./.env",
});
const express = require("express");
const app = express();
const logger = require("morgan");

// logger
app.use(logger("tiny"));

app.use("/", require("./routes/userRouters"));

// creating server
app.listen(process.env.PORT, () => {
  console.log(`Server running on Port ${process.env.PORT}`);
});
