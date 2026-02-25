import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

let io: Server | null = null;

const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isOriginAllowed = (origin?: string) => {
  if (!origin) return true; // mobile apps / Postman
  if (allowedOrigins.length === 0) return !isProduction;
  if (allowedOrigins.includes(origin)) return true;
  if (!isProduction && (origin.includes('localhost') || origin.includes('127.0.0.1'))) return true;
  return false;
};

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const token =
      socket.handshake.auth?.token ||
      (typeof socket.handshake.query?.token === 'string'
        ? socket.handshake.query.token
        : undefined);

    const jwtSecret = process.env.JWT_SECRET;
    let decoded: { userId?: string; role?: string } | null = null;

    if (token) {
      try {
        if (jwtSecret) {
          decoded = jwt.verify(token, jwtSecret) as { userId?: string; role?: string };
        }
      } catch (error) {
        // Ignore invalid token for socket connection
      }
    }

    const isAdmin = decoded?.role === 'admin' || decoded?.role === 'superadmin';
    socket.data.isAdmin = isAdmin;

    if (decoded?.userId) {
      socket.data.userId = decoded.userId;
      socket.join(`user:${decoded.userId}`);
    }

    if (isAdmin) {
      socket.join('admins');
    }

    socket.on('join-admin', () => {
      if (socket.data.isAdmin) {
        socket.join('admins');
      }
    });

    socket.on('join-user', (userId: string) => {
      if (userId && socket.data.userId && userId === socket.data.userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('chat:typing', (payload: { userId?: string; isTyping: boolean }) => {
      const isTyping = !!payload?.isTyping;
      const senderIsAdmin = !!socket.data.isAdmin;
      const targetUserId = senderIsAdmin ? payload?.userId : socket.data.userId;

      if (!targetUserId) return;

      const event = {
        userId: targetUserId,
        isTyping,
        fromAdmin: senderIsAdmin,
      };

      io?.to(`user:${targetUserId}`).emit('chat:typing', event);
      io?.to('admins').emit('chat:typing', event);
    });

    socket.on('chat:markRead', (payload: { userId?: string }) => {
      const senderIsAdmin = !!socket.data.isAdmin;
      const targetUserId = senderIsAdmin ? payload?.userId : socket.data.userId;

      if (!targetUserId) return;

      // Notify the user that their messages have been read
      if (senderIsAdmin) {
        io?.to(`user:${targetUserId}`).emit('chat:read', { userId: targetUserId });
      }
    });

    socket.on('chat:message', (payload: { userId?: string; message: any }) => {
      const senderIsAdmin = !!socket.data.isAdmin;
      const targetUserId = senderIsAdmin ? payload?.userId : socket.data.userId;

      if (!targetUserId) return;

      const messageData = {
        ...payload.message,
        userId: targetUserId,
        fromAdmin: senderIsAdmin,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to admins and the specific user
      io?.to('admins').emit('chat:message', messageData);
      io?.to(`user:${targetUserId}`).emit('chat:message', messageData);
    });
  });

  return io;
};

export const getSocket = () => io;
