const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const PORT = 5000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(__dirname + '/public'));


function generateRoomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let roomId = '';
    for (let i = 0; i < 6; i++) {
      roomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomId;
  }
  

// Store active connections and their respective rooms
const activeConnections = new Map();

// Socket.io connection event
io.on('connection', (socket) => {
  console.log('A user connected.');

  // Generate a random chat room ID
  const roomId = generateRoomId();

  // Join the room and store the connection with the room ID
  socket.join(roomId);
  activeConnections.set(socket.id, roomId);

  // Emit the room ID to the client
  socket.emit('room', roomId);

  // Handle chat messages
  socket.on('message', (message) => {
    const currentRoomId = activeConnections.get(socket.id);
    io.to(currentRoomId).emit('message', message);
  });

  // Handle room change
  socket.on('roomChange', (newRoomId) => {
    // Leave the current room
    const currentRoomId = activeConnections.get(socket.id);
    socket.leave(currentRoomId);

    // Join the new room and update the connection's room ID
    socket.join(newRoomId);
    activeConnections.set(socket.id, newRoomId);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    const currentRoomId = activeConnections.get(socket.id);
    socket.leave(currentRoomId);
    activeConnections.delete(socket.id);
    console.log('A user disconnected.');
  });
});



server.listen(PORT , ()=>{
    console.log(`listening on port number ${PORT}`);
})