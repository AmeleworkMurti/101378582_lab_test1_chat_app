const authRoutes = require("./routes/auth");


const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const messageRoutes = require("./routes/messages");


connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/messages", messageRoutes);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


const PrivateMessage = require("./models/PrivateMessage");


const GroupMessage = require("./models/GroupMessage");

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // leave room
  socket.on("leave_room", (room) => {
    socket.leave(room);
    console.log(`User left room: ${room}`);
  });

  // room message
  socket.on("room_message", async (data) => {
    const { from_user, room, message } = data;

    // Save to MongoDB
    const savedMessage = await GroupMessage.create({
      from_user,
      room,
      message
    });

    // Emit to room
    io.to(room).emit("receive_room_message", savedMessage);
  });

  // Typing indicator
  socket.on("typing", ({ username, room }) => {
    socket.to(room).emit("show_typing", `${username} is typing...`);
  });

  socket.on("stop_typing", ({ room }) => {
    socket.to(room).emit("hide_typing");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });



// User registers their username to this socket
socket.on("register_user", (username) => {
  socket.username = username;
  socket.join(`user:${username}`); // personal room
  console.log(`Registered user: ${username}`);
});

// Private message (1-to-1)
socket.on("private_message", async (data) => {
  const { from_user, to_user, message } = data;

  const saved = await PrivateMessage.create({
    from_user,
    to_user,
    message
  });

  // Send to receiver and sender
  io.to(`user:${to_user}`).emit("receive_private_message", saved);
  io.to(`user:${from_user}`).emit("receive_private_message", saved);
});

// Private typing indicator (1-to-1)
socket.on("private_typing", ({ from_user, to_user }) => {
  io.to(`user:${to_user}`).emit("show_private_typing", `${from_user} is typing...`);
});

socket.on("private_stop_typing", ({ to_user }) => {
  io.to(`user:${to_user}`).emit("hide_private_typing");
});








});



const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
