import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function joinEventRoom(eventId) {
  const s = getSocket();
  s.emit('event:join', { eventId });
  return () => s.emit('event:leave', { eventId });
}
