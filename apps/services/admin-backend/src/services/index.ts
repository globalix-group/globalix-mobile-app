import { User, Inquiry, Notification, Contact, CarReservation } from '../models';

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      };
    }

    return user;
  }

  static async updateUserProfile(userId: string, data: any) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      };
    }

    // Don't allow password updates here
    delete data.password;

    await user.update(data);
    return user;
  }

  static async updateUserPreferences(userId: string, preferences: any) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      };
    }

    user.preferences = { ...user.preferences, ...preferences };
    await user.save();

    return user;
  }

  static async uploadAvatar(userId: string, imageUrl: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      };
    }

    user.avatar = imageUrl;
    await user.save();

    return user;
  }
}

export class InquiryService {
  static async createInquiry(userId: string, propertyId: string, message: string) {
    return Inquiry.create({
      userId,
      propertyId,
      message,
    });
  }

  static async getUserInquiries(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Inquiry.findAndCountAll({
      where: { userId },
      include: ['property', 'user'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  static async getInquiryById(id: string) {
    const inquiry = await Inquiry.findByPk(id, {
      include: ['property', 'user'],
    });

    if (!inquiry) {
      throw {
        statusCode: 404,
        code: 'INQUIRY_NOT_FOUND',
        message: 'Inquiry not found',
      };
    }

    return inquiry;
  }

  static async updateInquiryStatus(id: string, status: string) {
    const inquiry = await Inquiry.findByPk(id);

    if (!inquiry) {
      throw {
        statusCode: 404,
        code: 'INQUIRY_NOT_FOUND',
        message: 'Inquiry not found',
      };
    }

    inquiry.status = status;
    await inquiry.save();

    return inquiry;
  }
}

export class NotificationService {
  static async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
    return Notification.create({
      userId,
      type,
      title,
      message,
      data: data || {},
    });
  }

  static async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  static async markNotificationAsRead(id: string) {
    const notification = await Notification.findByPk(id);

    if (!notification) {
      throw {
        statusCode: 404,
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found',
      };
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  static async markAllAsRead(userId: string) {
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    return { message: 'All notifications marked as read' };
  }
}

export class ContactService {
  static async createContact(
    name: string,
    email: string,
    subject: string,
    message: string,
    phone?: string
  ) {
    return Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });
  }

  static async getContacts(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Contact.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  static async getContactById(id: string) {
    const contact = await Contact.findByPk(id);

    if (!contact) {
      throw {
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
        message: 'Contact not found',
      };
    }

    return contact;
  }

  static async updateContactStatus(id: string, status: string) {
    const contact = await Contact.findByPk(id);

    if (!contact) {
      throw {
        statusCode: 404,
        code: 'CONTACT_NOT_FOUND',
        message: 'Contact not found',
      };
    }

    contact.status = status;
    await contact.save();

    return contact;
  }
}

export class CarReservationService {
  static async createReservation(
    userId: string,
    carId: string,
    startDate: Date,
    endDate: Date,
    pricePerDay: number
  ) {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * pricePerDay;

    return CarReservation.create({
      userId,
      carId,
      startDate,
      endDate,
      totalPrice,
    });
  }

  static async getUserReservations(userId: string) {
    return CarReservation.findAll({
      where: { userId },
      include: ['car', 'user'],
      order: [['createdAt', 'DESC']],
    });
  }

  static async getReservationById(id: string) {
    const reservation = await CarReservation.findByPk(id, {
      include: ['car', 'user'],
    });

    if (!reservation) {
      throw {
        statusCode: 404,
        code: 'RESERVATION_NOT_FOUND',
        message: 'Reservation not found',
      };
    }

    return reservation;
  }

  static async updateReservationStatus(id: string, status: string) {
    const reservation = await CarReservation.findByPk(id);

    if (!reservation) {
      throw {
        statusCode: 404,
        code: 'RESERVATION_NOT_FOUND',
        message: 'Reservation not found',
      };
    }

    reservation.status = status;
    await reservation.save();

    return reservation;
  }

  static async cancelReservation(id: string) {
    const reservation = await CarReservation.findByPk(id);

    if (!reservation) {
      throw {
        statusCode: 404,
        code: 'RESERVATION_NOT_FOUND',
        message: 'Reservation not found',
      };
    }

    reservation.status = 'Cancelled';
    await reservation.save();

    return reservation;
  }
}
