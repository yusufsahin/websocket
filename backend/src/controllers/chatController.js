// /controllers/chatController.js

const handleChatMessages = (socket) => {
    socket.on('sendMessage', (message) => {
      console.log(`Message received: ${message}`);
      socket.broadcast.emit('receiveMessage', message);  // Send message to other users
    });
  };
  
  module.exports = { handleChatMessages };
  