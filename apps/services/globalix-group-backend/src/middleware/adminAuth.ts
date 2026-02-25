import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type AdminTokenPayload = {
  id?: string;
  email?: string;
  role?: string;
};

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
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

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_AUTH_HEADER',
        message: 'Authorization header missing or invalid',
        statusCode: 401,
      },
    });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as AdminTokenPayload;
    const role = decoded?.role;
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
          statusCode: 403,
        },
      });
    }
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
