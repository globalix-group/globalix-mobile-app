import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { AppError } from '../middleware/errorHandler';

export class UserController {
  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'name', 'avatar', 'phone', 'bio', 'isEmailVerified', 'isPhoneVerified', 'createdAt', 'updatedAt'],
      });

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const { name, phone, bio, avatar } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }

      // Update fields
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (bio) user.bio = bio;
      if (avatar) user.avatar = avatar;

      await user.save();

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          phone: user.phone,
          bio: user.bio,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user avatar only
   */
  static async updateAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const { avatar } = req.body;
      if (!avatar) {
        throw new AppError(400, 'INVALID_REQUEST', 'Avatar URL is required');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
      }

      user.avatar = avatar;
      await user.save();

      res.json({
        success: true,
        data: {
          id: user.id,
          avatar: user.avatar,
        },
        message: 'Avatar updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
