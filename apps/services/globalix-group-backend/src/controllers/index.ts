import { Request, Response, NextFunction } from 'express';
import { UserService, InquiryService, NotificationService, ContactService, CarReservationService } from '../services';
import { AppError } from '../middleware/errorHandler';

// ===== USER CONTROLLER =====
export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const user = await UserService.getUserProfile(userId);
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

      const user = await UserService.updateUserProfile(userId, req.body);
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

      const user = await UserService.updateUserPreferences(userId, req.body);
      res.json({
        success: true,
        data: user,
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

      const { propertyId, message } = req.body;
      const inquiry = await InquiryService.createInquiry(userId, propertyId, message);

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

      const inquiries = await InquiryService.getUserInquiries(userId);
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

      const { id } = req.params;
      const inquiry = await InquiryService.updateInquiry(id, userId, req.body);

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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await NotificationService.getNotifications(userId, page, limit);
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

      const { id } = req.params;
      const notification = await NotificationService.markAsRead(id, userId);

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
      const { name, email, phone, message } = req.body;
      const contact = await ContactService.createContact(name, email, phone, message);

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ContactService.getContacts(page, limit);
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

      const { carId, startDate, endDate, totalPrice } = req.body;
      const reservation = await CarReservationService.createReservation(userId, carId, startDate, endDate, totalPrice);

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

      const reservations = await CarReservationService.getUserReservations(userId);
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

      const { id } = req.params;
      const reservation = await CarReservationService.updateReservation(id, userId, req.body);

      res.json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }
}
