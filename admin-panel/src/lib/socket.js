import { io } from 'socket.io-client';

let socket = null;

export function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw)?.id : null;
  } catch {
    return null;
  }
}

export function connectSocket() {
  if (socket) return socket;

  const userId = getCurrentUserId();
  socket = io('https://easyservice.tech/chat', {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    query: { userId },
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connect error:', err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  if (!socket) return connectSocket();
  return socket;
}

export function joinChatRoom(bookingId) {
  if (bookingId) getSocket().emit('chat:join-room', { bookingId });
}

export function leaveChatRoom(bookingId) {
  if (bookingId) getSocket().emit('chat:leave-room', { bookingId });
}

export function sendChatMessage(payload) {
  getSocket().emit('chat:send', payload);
}

export function emitTyping(receiverId, bookingId = null) {
  getSocket().emit('chat:typing', { receiverId, bookingId });
}

export function emitMessageRead(senderId) {
  getSocket().emit('chat:message-read', { senderId });
}
