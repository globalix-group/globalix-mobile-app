import { Request, Response, NextFunction } from 'express';
import { UserService, InquiryService, NotificationService, ContactService, CarReservationService, ChatService } from '../services';
import { AppError } from '../middleware/errorHandler';
import { getSocket } from '../socket';

const emitChatMessage = (message: any) => {
  const io = getSocket();
  if (!io) return;

  const payload = typeof message?.toJSON === 'function' ? message.toJSON() : message;
  const userRoom = `user:${payload.userId}`;

  io.to(userRoom).emit('chat:message', payload);
  io.to('admins').emit('chat:message', payload);
};

// ===== CHAT CONTROLLER =====
export class ChatController {
  static async getUserChats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const messages = await ChatService.getUserChats(tenantId, userId);
      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { message } = req.body;
      if (!message || !message.trim()) {
        throw new AppError(400, 'INVALID_MESSAGE', 'Message is required');
      }

      const chatMessage = await ChatService.sendMessage(tenantId, userId, message, false);
      emitChatMessage(chatMessage);
      res.json({
        success: true,
        data: chatMessage,
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminSendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, message } = req.body;
      if (!userId || !message || !message.trim()) {
        throw new AppError(400, 'INVALID_REQUEST', 'User ID and message are required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const chatMessage = await ChatService.sendMessage(tenantId, userId, message, true);
      emitChatMessage(chatMessage);
      res.json({
        success: true,
        data: chatMessage,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      await ChatService.markUserMessagesAsRead(tenantId, userId, true);
      res.json({
        success: true,
        message: 'Messages marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const count = await ChatService.getUnreadCount(tenantId, userId);
      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  static async clearUserChats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      await ChatService.clearUserChats(tenantId, userId);
      res.json({
        success: true,
        message: 'Chat cleared successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUserChats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const users = await ChatService.getAllUserChats(tenantId);
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}

// ===== USER CONTROLLER =====
export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;

      const result = await UserService.getAllUsers(tenantId, page, limit, search);
      res.json({
        success: true,
        data: result.data,
        total: result.total,
        page: page,
        pages: Math.ceil(result.total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const user = await UserService.getUserProfile(tenantId, userId);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { name, phone, bio, avatar } = req.body || {};
      const updates: Record<string, any> = {};

      if (typeof name === 'string') updates.name = name.trim();
      if (typeof phone === 'string') updates.phone = phone.trim();
      if (typeof bio === 'string') updates.bio = bio.trim();
      if (typeof avatar === 'string') updates.avatar = avatar;

      const user = await UserService.updateUserProfile(tenantId, userId, updates);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const user = await UserService.updateUserPreferences(tenantId, userId, req.body);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = req.userId;
      if (!requesterId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { id } = req.params;
      if (!id) {
        throw new AppError(400, 'BAD_REQUEST', 'User ID is required');
      }

      if (requesterId !== id) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this user');
      }

      await UserService.deleteUser(tenantId, id);
      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

// ===== INQUIRY CONTROLLER =====
export class InquiryController {
  static async createInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { propertyId, message } = req.body;
      const inquiry = await InquiryService.createInquiry(tenantId, userId, propertyId, message);

      res.status(201).json({
        success: true,
        data: inquiry,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserInquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const inquiries = await InquiryService.getUserInquiries(tenantId, userId);
      res.json({
        success: true,
        data: inquiries,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { id } = req.params;
      const inquiry = await InquiryService.updateInquiry(tenantId, id, userId, req.body);

      res.json({
        success: true,
        data: inquiry,
      });
    } catch (error) {
      next(error);
    }
  }
}

// ===== NOTIFICATION CONTROLLER =====
export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await NotificationService.getNotifications(tenantId, userId, page, limit);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { id } = req.params;
      const notification = await NotificationService.markAsRead(tenantId, id, userId);

      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
}

// ===== CONTACT CONTROLLER =====
export class ContactController {
  static async createContact(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const { name, email, phone, message } = req.body;
      const contact = await ContactService.createContact(tenantId, name, email, phone, message);

      res.status(201).json({
        success: true,
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ContactService.getContacts(tenantId, page, limit);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

// ===== CAR RESERVATION CONTROLLER =====
export class CarReservationController {
  static async createReservation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { carId, startDate, endDate, totalPrice } = req.body;
      const reservation = await CarReservationService.createReservation(tenantId, userId, carId, startDate, endDate, totalPrice);

      res.status(201).json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const reservations = await CarReservationService.getUserReservations(tenantId, userId);
      res.json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateReservation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { id } = req.params;
      const reservation = await CarReservationService.updateReservation(tenantId, id, userId, req.body);

      res.json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }
}
