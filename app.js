require("dotenv").config({
  path: "./.env",
});
const express = require("express");
const app = express();
const logger = require("morgan");
const ErrorHandler = require("./utils/ErrorHandler");
const { generatedError } = require("./middlewares/errors");

// db connection
require("./database").connectDatabase();

// logger
app.use(logger("tiny"));

// bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", require("./routes/userRouters"));

// error handleing
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Requested URL Not Found ${req.url}`, 404));
});
app.use(generatedError);

// creating server
app.listen(process.env.PORT, () => {
  console.log(`Server running on Port ${process.env.PORT}`);
});
