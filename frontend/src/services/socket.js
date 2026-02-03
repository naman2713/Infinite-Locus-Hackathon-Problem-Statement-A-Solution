import io from 'socket.io-client';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
class SocketService {
  constructor() { this.socket = null; }
  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      this.socket.on('connect', () => { console.log('Connected to socket server'); });
      this.socket.on('disconnect', () => { console.log('Disconnected from socket server'); });
    }
    return this.socket;
  }
  disconnect() { if (this.socket) { this.socket.disconnect(); this.socket = null; } }
  joinDocument(documentId, user) { if (this.socket) this.socket.emit('join-document', { documentId, user }); }
  leaveDocument(documentId) { if (this.socket) this.socket.emit('leave-document', { documentId }); }
  sendDocumentChange(documentId, content, user) { if (this.socket) this.socket.emit('document-change', { documentId, content, user }); }
  onDocumentUpdate(callback) { if (this.socket) this.socket.on('document-update', callback); }
  onUserJoined(callback) { if (this.socket) this.socket.on('user-joined', callback); }
  onUserLeft(callback) { if (this.socket) this.socket.on('user-left', callback); }
  onActiveUsers(callback) { if (this.socket) this.socket.on('active-users', callback); }
  removeAllListeners() { if (this.socket) this.socket.removeAllListeners(); }
}
export default new SocketService();