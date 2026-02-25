import { User, Inquiry, Notification, Contact, CarReservation, ChatMessage, UserMedia } from '../models';
import { AppError } from '../middleware/errorHandler';

// ===== CHAT SERVICE =====
export class ChatService {
  static async getUserChats(tenantId: string, userId: string) {
    const messages = await ChatMessage.findAll({
      where: { userId, tenantId },
      order: [['createdAt', 'DESC']],
    });

    return messages;
  }

  static async sendMessage(tenantId: string, userId: string, message: string, fromAdmin: boolean = false) {
    const chatMessage = await ChatMessage.create({
      tenantId,
      userId,
      message,
      fromAdmin,
      read: false,
    });

    return chatMessage;
  }

  static async markAsRead(messageId: string) {
    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      throw new AppError(404, 'MESSAGE_NOT_FOUND', 'Message not found');
    }

    await message.update({ read: true });
    return message;
  }

  static async markUserMessagesAsRead(tenantId: string, userId: string, fromAdmin: boolean = false) {
    await ChatMessage.update(
      { read: true },
      {
        where: {
          tenantId,
          userId,
          fromAdmin,
          read: false,
        },
      }
    );
  }

  static async getUnreadCount(tenantId: string, userId: string) {
    const count = await ChatMessage.count({
      where: {
        tenantId,
        userId,
        fromAdmin: true,
        read: false,
      },
    });

    return count;
  }

  static async clearUserChats(tenantId: string, userId: string) {
    await ChatMessage.destroy({
      where: { userId, tenantId },
    });
  }

  static async getAllUserChats(tenantId: string) {
    const users = await User.findAll({
      where: { tenantId },
      attributes: ['id', 'name', 'email', 'avatar', 'phone', 'createdAt'],
      include: [
        {
          model: ChatMessage,
          as: 'chatMessages',
          where: { tenantId },
          separate: true,
          order: [['createdAt', 'ASC']],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return users;
  }
}

// ===== USER SERVICE =====
export class UserService {
  static async getAllUsers(tenantId: string, page: number = 1, limit: number = 20, search?: string) {
    const offset = (page - 1) * limit;
    const where: any = { tenantId };

    if (search) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      data: rows,
    };
  }

  static async getUserProfile(tenantId: string, userId: string) {
    const user = await User.findOne({
      where: { id: userId, tenantId },
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return user;
  }

  static async updateUserProfile(tenantId: string, userId: string, data: any) {
    const user = await User.findOne({ where: { id: userId, tenantId } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    await user.update(data);
    return user;
  }

  static async updateUserPreferences(tenantId: string, userId: string, preferences: Record<string, any>) {
    const user = await User.findOne({ where: { id: userId, tenantId } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    return user;
  }

  static async deleteUser(tenantId: string, userId: string) {
    const user = await User.findOne({ where: { id: userId, tenantId } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    try {
      // Delete all related data with force: true to bypass constraints
      await Promise.all([
        Inquiry.destroy({ where: { userId, tenantId }, force: true }),
        Notification.destroy({ where: { userId, tenantId }, force: true }),
        Contact.destroy({ where: { userId, tenantId }, force: true }),
        ChatMessage.destroy({ where: { userId, tenantId }, force: true }),
        UserMedia.destroy({ where: { userId, tenantId }, force: true }),
        CarReservation.destroy({ where: { userId, tenantId }, force: true }),
      ]);

      // Delete the user
      await user.destroy();
      return true;
    } catch (error: any) {
      console.error('Delete user error:', error);
      throw new AppError(500, 'DELETE_ERROR', `Failed to delete user: ${error.message}`);
    }
  }
}

// ===== INQUIRY SERVICE =====
export class InquiryService {
  static async createInquiry(tenantId: string, userId: string, propertyId: string, message: string) {
    return await Inquiry.create({
      tenantId,
      userId,
      propertyId,
      message,
    });
  }

  static async getUserInquiries(tenantId: string, userId: string) {
    return await Inquiry.findAll({
      where: { userId, tenantId },
      include: ['property'],
    });
  }

  static async updateInquiry(tenantId: string, id: string, userId: string, data: any) {
    const inquiry = await Inquiry.findOne({ where: { id, tenantId } });
    if (!inquiry) {
      throw new AppError(404, 'INQUIRY_NOT_FOUND', 'Inquiry not found');
    }

    if (inquiry.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this inquiry');
    }

    const updates: Record<string, any> = {};
    if (typeof data?.message === 'string') {
      updates.message = data.message.trim();
    }

    await inquiry.update(updates);
    return inquiry;
  }
}

// ===== NOTIFICATION SERVICE =====
export class NotificationService {
  static async getNotifications(tenantId: string, userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Notification.findAndCountAll({
      where: { userId, tenantId },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: rows,
    };
  }

  static async markAsRead(tenantId: string, id: string, userId: string) {
    const notification = await Notification.findOne({ where: { id, tenantId } });
    if (!notification) {
      throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this notification');
    }

    await notification.update({ isRead: true });
    return notification;
  }

  static async createNotification(tenantId: string, userId: string, type: string, title: string, message: string, data?: Record<string, any>) {
    return await Notification.create({
      tenantId,
      userId,
      type,
      title,
      message,
      data: data || {},
    });
  }
}

// ===== CONTACT SERVICE =====
export class ContactService {
  static async createContact(tenantId: string, name: string, email: string, phone: string, message: string) {
    return await Contact.create({
      tenantId,
      name: typeof name === 'string' ? name.trim() : name,
      email: typeof email === 'string' ? email.trim().toLowerCase() : email,
      phone: typeof phone === 'string' ? phone.trim() : phone,
      message: typeof message === 'string' ? message.trim() : message,
    });
  }

  static async getContacts(tenantId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Contact.findAndCountAll({
      where: { tenantId },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: rows,
    };
  }
}

// ===== CAR RESERVATION SERVICE =====
export class CarReservationService {
  static async createReservation(tenantId: string, userId: string, carId: string, startDate: Date, endDate: Date, totalPrice: number) {
    return await CarReservation.create({
      tenantId,
      userId,
      carId,
      startDate,
      endDate,
      totalPrice,
    });
  }

  static async getUserReservations(tenantId: string, userId: string) {
    return await CarReservation.findAll({
      where: { userId, tenantId },
      include: ['car'],
    });
  }

  static async updateReservation(tenantId: string, id: string, userId: string, data: any) {
    const reservation = await CarReservation.findOne({ where: { id, tenantId } });
    if (!reservation) {
      throw new AppError(404, 'RESERVATION_NOT_FOUND', 'Reservation not found');
    }

    if (reservation.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this reservation');
    }

    const updates: Record<string, any> = {};
    if (typeof data?.startDate === 'string' || data?.startDate instanceof Date) {
      updates.startDate = data.startDate;
    }
    if (typeof data?.endDate === 'string' || data?.endDate instanceof Date) {
      updates.endDate = data.endDate;
    }
    if (typeof data?.totalPrice === 'number') {
      updates.totalPrice = data.totalPrice;
    }

    await reservation.update(updates);
    return reservation;
  }
}
