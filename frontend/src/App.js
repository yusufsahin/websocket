import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3100', {
  withCredentials: true,
});

function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [messages, setMessages] = useState([]);  // Chat mesajları
  const [newMessage, setNewMessage] = useState("");  // Yeni chat mesajı girişi

  const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  // Yeni bir Peer Connection başlat
  const createPeerConnection = () => {
    if (peerConnection && peerConnection.signalingState !== "closed") {
      peerConnection.close();  // Önceki bağlantıyı kapat
    }

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('candidate', event.candidate);
      }
    };

    pc.ontrack = event => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    setPeerConnection(pc);  // Yeni peer connection'ı kaydet
    return pc;
  };

  useEffect(() => {
    const pc = createPeerConnection();

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      })
      .catch(error => console.error('Yerel video alınamadı:', error));

    // WebRTC offer, answer, candidate işlemleri
    socket.on('offer', (offer) => {
      if (pc.signalingState === "closed") return;  // Bağlantı kapalıysa işlem yapma
      pc.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => pc.createAnswer())
        .then(answer => {
          pc.setLocalDescription(answer);
          socket.emit('answer', answer);
        })
        .catch(error => console.error('Yanıt oluşturulamadı:', error));
    });

    socket.on('answer', (answer) => {
      if (pc.signalingState !== "closed") {
        pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('candidate', (candidate) => {
      if (pc.signalingState !== "closed") {
        pc.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(error => console.error('ICE Candidate eklenemedi:', error));
      }
    });

    // Chat mesajları
    socket.on('receiveMessage', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);  // Gelen mesajı ekle
    });

    return () => {
      pc.close();  // Bileşen kaldırıldığında bağlantıyı kapat
    };
  }, []);

  const startCall = () => {
    const pc = createPeerConnection();  // Yeni bağlantıyı başlat
    setIsCalling(true);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        return pc.createOffer();
      })
      .then(offer => {
        pc.setLocalDescription(offer);
        socket.emit('offer', offer);
      })
      .catch(error => console.error('Teklif oluşturulamadı:', error));
  };

  const sendMessage = () => {
    socket.emit('sendMessage', `Ben: ${newMessage}`);
    setMessages(prevMessages => [...prevMessages, `Ben: ${newMessage}`]);
    setNewMessage("");  // Mesaj kutusunu temizle
  };

  return (
    <div className="app">
      <h1>WebRTC Video Görüşmesi ve Chat</h1>
      <div className="videos">
        <div className="video-container">
          <h2>Yerel Video</h2>
          <video ref={localVideoRef} autoPlay playsInline muted />
        </div>
        <div className="video-container">
          <h2>Uzaktaki Kullanıcı Videosu</h2>
          <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
      </div>
      <button className="call-button" onClick={startCall} disabled={isCalling}>
        {isCalling ? 'Arama Başladı' : 'Görüşme Başlat'}
      </button>

      {/* Chat bölümü */}
      <div className="chat-container">
        <h2>Chat</h2>
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className="chat-message">{msg}</div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
          />
          <button onClick={sendMessage}>Gönder</button>
        </div>
      </div>
    </div>
  );
}

export default App;
