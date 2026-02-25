import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ActivityLogger } from '../services/activityService';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Email, password, and name are required');
      }

      const user = await AuthService.register(tenantId, email, password, name);
      
      // Log signup activity
      ActivityLogger.log(tenantId, user.id, `New signup: ${name}`, 'signup', {
        email,
        name,
      });

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Email and password are required');
      }

      const result = await AuthService.login(tenantId, email, password);
      
      // Log login activity
      ActivityLogger.log(tenantId, result.user.id, `User login: ${result.user.name || email}`, 'login', {
        email,
        name: result.user.name,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Refresh token is required');
      }

      const result = await AuthService.refreshToken(tenantId, refreshToken);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const { email } = req.body;

      if (!email) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Email is required');
      }

      const result = await AuthService.forgotPassword(tenantId, email);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async appleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const { appleId, email, name } = req.body;

      const result = await AuthService.appleSignIn(tenantId, appleId, email, name);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }
      const { googleId, email, name, avatar } = req.body;

      const result = await AuthService.googleSignIn(tenantId, googleId, email, name, avatar);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
