require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});
connectDB();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.get('/api/health', (req, res) => { res.json({ status: 'ok', message: 'Server is running' }); });
const documentRooms = new Map();
const userSockets = new Map();
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('join-document', ({ documentId, user }) => {
    socket.join(documentId);
    if (!documentRooms.has(documentId)) documentRooms.set(documentId, new Set());
    documentRooms.get(documentId).add(socket.id);
    userSockets.set(socket.id, { ...user, documentId });
    const activeUsers = Array.from(documentRooms.get(documentId)).map((socketId) => userSockets.get(socketId)).filter((u) => u);
    socket.to(documentId).emit('user-joined', { user, activeUsers });
    socket.emit('active-users', activeUsers);
    console.log(`User ${user.username} joined document ${documentId}`);
  });
  socket.on('leave-document', ({ documentId }) => {
    socket.leave(documentId);
    const user = userSockets.get(socket.id);
    if (documentRooms.has(documentId)) {
      documentRooms.get(documentId).delete(socket.id);
      if (documentRooms.get(documentId).size === 0) documentRooms.delete(documentId);
    }
    const activeUsers = documentRooms.has(documentId) ? Array.from(documentRooms.get(documentId)).map((socketId) => userSockets.get(socketId)).filter((u) => u) : [];
    if (user) {
      socket.to(documentId).emit('user-left', { user, activeUsers });
      console.log(`User ${user.username} left document ${documentId}`);
    }
  });
  socket.on('document-change', ({ documentId, content, user }) => {
    socket.to(documentId).emit('document-update', { content, user });
  });
  socket.on('cursor-position', ({ documentId, position, user }) => {
    socket.to(documentId).emit('cursor-update', { position, user });
  });
  socket.on('disconnect', () => {
    const user = userSockets.get(socket.id);
    if (user && user.documentId) {
      const documentId = user.documentId;
      if (documentRooms.has(documentId)) {
        documentRooms.get(documentId).delete(socket.id);
        if (documentRooms.get(documentId).size === 0) {
          documentRooms.delete(documentId);
        } else {
          const activeUsers = Array.from(documentRooms.get(documentId)).map((socketId) => userSockets.get(socketId)).filter((u) => u);
          io.to(documentId).emit('user-left', { user, activeUsers });
        }
      }
    }
    userSockets.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });