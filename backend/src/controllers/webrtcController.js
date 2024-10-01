// /controllers/webrtcController.js

const handleWebRTCSignal = (socket) => {
    socket.on('offer', (offer) => {
      console.log(`Offer received: ${socket.id}`);
      socket.broadcast.emit('offer', offer);  // Broadcast offer to other users
    });
  
    socket.on('answer', (answer) => {
      console.log(`Answer received: ${socket.id}`);
      socket.broadcast.emit('answer', answer);  // Broadcast answer to other users
    });
  
    socket.on('candidate', (candidate) => {
      console.log(`ICE Candidate received: ${socket.id}`);
      socket.broadcast.emit('candidate', candidate);  // Broadcast ICE Candidate to other users
    });
  };
  
  module.exports = { handleWebRTCSignal };
  