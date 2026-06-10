import { io, Socket } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    console.log('Socket.io client connected to backend.');
  }
  return socket;
}

export function joinOrderTracking(orderId: number) {
  const s = getSocket();
  s.emit('join_order', orderId.toString());
}

export function subscribeToInventory(callback: (data: { productId: number; stock: number }) => void) {
  const s = getSocket();
  s.on('inventory_update', callback);
  return () => {
    s.off('inventory_update', callback);
  };
}

export function subscribeToOrderStatus(callback: (data: { orderId: number; status: string }) => void) {
  const s = getSocket();
  s.on('order_status_update', callback);
  return () => {
    s.off('order_status_update', callback);
  };
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket.io client disconnected.');
  }
}
