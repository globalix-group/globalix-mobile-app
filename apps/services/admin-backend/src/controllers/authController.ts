import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { body, validationResult } from 'express-validator';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'AUTH_ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            statusCode: 400,
            details: errors.array(),
          },
        });
      }

      const { email, password, name } = req.body;

      const result = await AuthService.register(email, password, name);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'AUTH_ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: 'Refresh token required',
            statusCode: 400,
          },
        });
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'AUTH_ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'AUTH_ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async appleSignIn(req: Request, res: Response) {
    try {
      const { identityToken } = req.body;

      const result = await AuthService.appleSignIn(identityToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'AUTH_ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async googleSignIn(req: Request, res: Response) {
    try {
      const { idToken } = req.body;

      const result = await AuthService.googleSignIn(idToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'AUTH_ERROR',
          message: error.message,
          statusCode: error.statusCode || 500,
        },
      });
    }
  }

  static async logout(req: Request, res: Response) {
    // In production, implement token blacklisting
    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  }
}
