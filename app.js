require("dotenv").config({
  path: "./.env",
});
const express = require("express");
const app = express();
const logger = require("morgan");
const cors = require("cors");
const ErrorHandler = require("./utils/ErrorHandler");
const { generatedError } = require("./middlewares/errors");
const session = require("express-session");
const cookieparser = require("cookie-parser");
const expressfileupload = require("express-fileupload");
const http = require("http");
const { initSocketIo } = require("./socket/socket");

// db connection
require("./config/database").connectDatabase();

const server = http.createServer(app);

// initialized socket.io
initSocketIo(server);

// session and cookie
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);
app.use(cookieparser());

// logger
app.use(logger("tiny"));

// bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cors
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

// express-fileupload
app.use(expressfileupload());

// routes
app.use("/", require("./routes/userRoutes"));
app.use("/post", require("./routes/postRoutes"));
app.use("/chat", require("./routes/messageRoutes"));

// error handleing
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Requested URL Not Found ${req.url}`, 404));
});
app.use(generatedError);

// creating server
server.listen(process.env.PORT, () => {
  console.log(`Server running on Port ${process.env.PORT}`);
});
