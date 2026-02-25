import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      token?: string;
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
          code: 'NO_TOKEN',
          message: 'Authorization token not provided',
          statusCode: 401,
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; tenantId?: string };
    req.userId = decoded.userId;
    if (decoded.tenantId) {
      req.tenantId = decoded.tenantId;
    }
    req.token = token;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        statusCode: 401,
      },
    });
  }
};

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!process.env.JWT_SECRET) {
      return next();
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; tenantId?: string };
      req.userId = decoded.userId;
      if (decoded.tenantId) {
        req.tenantId = decoded.tenantId;
      }
      req.token = token;
    }
    return next();
  } catch (error) {
    return next();
  }
};
