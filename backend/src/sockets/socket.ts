import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function initSocket(server: HttpServer) {
  const allowedOrigins = [
    'http://localhost:5173',
    process.env.CORS_ORIGIN
  ].filter(Boolean) as string[];

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.railway.app') || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join order-specific rooms for real-time order tracking
    socket.on('join_order', (orderId: string) => {
      socket.join(`order_${orderId}`);
      console.log(`Socket ${socket.id} joined room: order_${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function broadcastInventoryUpdate(productId: number, stock: number) {
  if (io) {
    io.emit('inventory_update', { productId, stock });
    console.log(`Broadcast: inventory_update for product ${productId} -> stock: ${stock}`);
  }
}

export function sendOrderStatusUpdate(orderId: number, status: string) {
  if (io) {
    io.to(`order_${orderId}`).emit('order_status_update', { orderId, status });
    console.log(`Room Emit: order_status_update for order ${orderId} -> status: ${status}`);
  }
}
