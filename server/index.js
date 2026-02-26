const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const socketHandler = require("./socket/socketHandler");

const app = express();

// Enable CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Use your socket handler
socketHandler(io);

// 🔥 IMPORTANT: Dynamic Port for Render
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});