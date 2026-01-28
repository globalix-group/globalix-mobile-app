import { User, Inquiry, Notification, Contact, CarReservation } from '../models';
import { AppError } from '../middleware/errorHandler';

// ===== USER SERVICE =====
export class UserService {
  static async getUserProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return user;
  }

  static async updateUserProfile(userId: string, data: any) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    await user.update(data);
    return user;
  }

  static async updateUserPreferences(userId: string, preferences: Record<string, any>) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    return user;
  }
}

// ===== INQUIRY SERVICE =====
export class InquiryService {
  static async createInquiry(userId: string, propertyId: string, message: string) {
    return await Inquiry.create({
      userId,
      propertyId,
      message,
    });
  }

  static async getUserInquiries(userId: string) {
    return await Inquiry.findAll({
      where: { userId },
      include: ['property'],
    });
  }

  static async updateInquiry(id: string, userId: string, data: any) {
    const inquiry = await Inquiry.findByPk(id);
    if (!inquiry) {
      throw new AppError(404, 'INQUIRY_NOT_FOUND', 'Inquiry not found');
    }

    if (inquiry.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this inquiry');
    }

    await inquiry.update(data);
    return inquiry;
  }
}

// ===== NOTIFICATION SERVICE =====
export class NotificationService {
  static async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Notification.findAndCountAll({
      where: { userId },
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

  static async markAsRead(id: string, userId: string) {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this notification');
    }

    await notification.update({ isRead: true });
    return notification;
  }

  static async createNotification(userId: string, type: string, title: string, message: string, data?: Record<string, any>) {
    return await Notification.create({
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
  static async createContact(name: string, email: string, phone: string, message: string) {
    return await Contact.create({
      name,
      email,
      phone,
      message,
    });
  }

  static async getContacts(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Contact.findAndCountAll({
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
  static async createReservation(userId: string, carId: string, startDate: Date, endDate: Date, totalPrice: number) {
    return await CarReservation.create({
      userId,
      carId,
      startDate,
      endDate,
      totalPrice,
    });
  }

  static async getUserReservations(userId: string) {
    return await CarReservation.findAll({
      where: { userId },
      include: ['car'],
    });
  }

  static async updateReservation(id: string, userId: string, data: any) {
    const reservation = await CarReservation.findByPk(id);
    if (!reservation) {
      throw new AppError(404, 'RESERVATION_NOT_FOUND', 'Reservation not found');
    }

    if (reservation.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this reservation');
    }

    await reservation.update(data);
    return reservation;
  }
}
