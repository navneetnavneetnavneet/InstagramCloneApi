require("dotenv").config({
  path: "./.env",
});
const express = require("express");
// const app = express();
const logger = require("morgan");
const cors = require("cors");
const ErrorHandler = require("./utils/ErrorHandler");
const { generateError } = require("./middlewares/errors.middleware.js");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const expressfileupload = require("express-fileupload");
const { app, server } = require("./socket/socket");
const port = process.env.PORT || 3000;

// const router
const userRouter = require("./routes/user.routes.js");
const postRouter = require("./routes/post.routes.js");
const storyRouter = require("./routes/story.routes.js");

// db connection
require("./config/db.config.js").connectDatabase();

// session and cookie
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);
app.use(cookieParser());

// logger
app.use(logger("tiny"));

// bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cors
app.use(cors({ credentials: true, origin: process.env.REACT_BASE_URL }));

// express-fileupload
app.use(expressfileupload());

// routes
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/stories", storyRouter);

// error handleing
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Requested URL Not Found ${req.url}`, 404));
});
app.use(generateError);

// creating server
server.listen(port, () => {
  console.log(`Server running on Port ${port}`);
});
