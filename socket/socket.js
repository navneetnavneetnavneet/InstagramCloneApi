const { Server } = require("socket.io");

let io;

module.exports.initSocketIo = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    // user disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
};
