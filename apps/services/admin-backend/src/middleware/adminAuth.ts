import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request to include admin data
declare global {
  namespace Express {
    interface Request {
      admin?: {
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Admin Authentication Middleware
 * Verifies JWT token and ensures only authorized admin can access protected routes
 */
export const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        email: string;
        role: string;
      };

      // Ensure it's actually an admin token
      if (decoded.role !== 'admin') {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      // Attach admin info to request
      req.admin = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};
