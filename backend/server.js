const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

// Uygulama ve Sunucu Başlatma
const app = express();
const server = http.createServer(app);

// CORS Middleware: Belirli kaynaklardan gelen isteklere izin veriyoruz
app.use(cors({
  origin: 'http://localhost:3000', // React uygulamanızın adresi
  credentials: true  // Credentials gerektiren istekleri kabul etmek için
}));

// Socket.IO Başlatma
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',  // Sadece React uygulamanızın erişimine izin ver
    methods: ['GET', 'POST'],
    credentials: true  // Credentials modunu destekle
  }
});

// Sinyal İşlemleri
const handleWebRTCSignal = (socket) => {
  socket.on('offer', (offer) => {
    console.log(`Offer alındı: ${socket.id}`);
    socket.broadcast.emit('offer', offer);  // Teklifi diğer kullanıcılara yay
  });

  socket.on('answer', (answer) => {
    console.log(`Answer alındı: ${socket.id}`);
    socket.broadcast.emit('answer', answer);  // Yanıtı diğer kullanıcılara yay
  });

  socket.on('candidate', (candidate) => {
    console.log(`ICE Candidate alındı: ${socket.id}`);
    socket.broadcast.emit('candidate', candidate);  // ICE Candidate'ı diğer kullanıcılara yay
  });
};

// Chat Mesajları İşleme
const handleChatMessages = (socket) => {
  socket.on('sendMessage', (message) => {
    console.log(`Mesaj alındı: ${message}`);
    socket.broadcast.emit('receiveMessage', message);  // Mesajı diğer kullanıcılara gönder
  });
};

// Bağlantı işlemi
io.on('connection', (socket) => {
  console.log('Yeni bir kullanıcı bağlandı:', socket.id);

  // WebRTC sinyalleşme işlemleri
  handleWebRTCSignal(socket);

  // Chat mesajları işlemi
  handleChatMessages(socket);

  // Bağlantı kesilmesi
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3100;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} numaralı portta çalışıyor.`);
});


/*
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

// Include controllers
const { handleWebRTCSignal } = require('./src/controllers/webrtcController');
const { handleChatMessages } = require('./src/controllers/chatController');

// Initialize Express app and create server
const app = express();
const server = http.createServer(app);

// Enable CORS: Allow requests from all origins
app.use(cors());

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // WebRTC signaling
  handleWebRTCSignal(socket);

  // Chat messages
  handleChatMessages(socket);

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server on port 3100
const PORT = process.env.PORT || 3100;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

*/