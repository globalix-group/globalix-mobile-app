import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_CONFIG_MISSING',
          message: 'JWT secret is not configured',
          statusCode: 500,
        },
      });
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_MISSING_TOKEN',
          message: 'No authentication token provided',
          statusCode: 401,
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = (decoded as any).userId;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_INVALID_TOKEN',
        message: 'Invalid or expired token',
        statusCode: 401,
      },
    });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    void res;
    if (!process.env.JWT_SECRET) {
      return next();
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = (decoded as any).userId;
    }
  } catch (error) {
    // Optional auth, so we don't fail if token is invalid
  }

  return next();
};
