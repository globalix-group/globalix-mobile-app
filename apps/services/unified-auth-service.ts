import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

// ===== UNIFIED AUTHENTICATION SERVICE =====
// Consistent authentication across all backends

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DecodedToken {
  userId: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  iat: number;
  exp: number;
}

// ===== PASSWORD VALIDATION =====
export class PasswordValidator {
  static readonly MIN_LENGTH = 12;
  static readonly REQUIRES_UPPERCASE = true;
  static readonly REQUIRES_LOWERCASE = true;
  static readonly REQUIRES_NUMBER = true;
  static readonly REQUIRES_SYMBOL = true;

  static validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }

    if (this.REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter (A-Z)');
    }

    if (this.REQUIRES_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter (a-z)');
    }

    if (this.REQUIRES_NUMBER && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number (0-9)');
    }

    if (this.REQUIRES_SYMBOL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    // Check for sequential characters
    if (this.hasSequentialCharacters(password)) {
      errors.push('Password contains sequential characters (abc, 123, etc.)');
    }

    // Check for repeated characters
    if (this.hasRepeatedCharacters(password)) {
      errors.push('Password contains too many repeated characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static hasSequentialCharacters(password: string): boolean {
    const sequences = ['abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz', '012', '123', '234', '345', '456', '567', '678', '789', '890'];
    return sequences.some((seq) => password.toLowerCase().includes(seq));
  }

  private static hasRepeatedCharacters(password: string): boolean {
    return /(.)\1{2,}/.test(password);
  }
}

// ===== JWT TOKEN MANAGEMENT =====
export class TokenManager {
  private static readonly ACCESS_TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours
  private static readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
  private static readonly TOKEN_BLACKLIST = new Set<string>();

  static generateTokens(userId: string, email: string, role: 'user' | 'agent' | 'admin'): AuthTokens {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || !refreshSecret) {
      throw new Error('JWT secrets not configured');
    }

    const accessToken = jwt.sign(
      {
        userId,
        email,
        role,
        type: 'access',
      },
      jwtSecret,
      {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        algorithm: 'HS256',
      }
    );

    const refreshToken = jwt.sign(
      {
        userId,
        email,
        role,
        type: 'refresh',
      },
      refreshSecret,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        algorithm: 'HS256',
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    };
  }

  static verifyAccessToken(token: string): DecodedToken {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    if (this.TOKEN_BLACKLIST.has(token)) {
      throw new Error('Token has been revoked');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
      }) as DecodedToken & { type: string };

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static verifyRefreshToken(token: string) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT refresh secret not configured');
    }

    try {
      const decoded = jwt.verify(token, refreshSecret, {
        algorithms: ['HS256'],
      }) as DecodedToken & { type: string };

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static blacklistToken(token: string) {
    this.TOKEN_BLACKLIST.add(token);
  }

  static isTokenBlacklisted(token: string): boolean {
    return this.TOKEN_BLACKLIST.has(token);
  }
}

// ===== PASSWORD HASHING =====
export class PasswordManager {
  private static readonly SALT_ROUNDS = 12;

  static async hash(password: string): Promise<string> {
    const validation = PasswordValidator.validate(password);
    if (!validation.valid) {
      throw new Error(`Invalid password: ${validation.errors.join(', ')}`);
    }
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// ===== UNIFIED AUTHENTICATION MIDDLEWARE =====
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      email?: string;
      role?: 'user' | 'agent' | 'admin';
      token?: string;
      decodedToken?: DecodedToken;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_AUTH_HEADER',
          message: 'Authorization header missing',
          statusCode: 401,
        },
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH_FORMAT',
          message: 'Authorization header must be "Bearer <token>"',
          statusCode: 401,
        },
      });
    }

    const token = parts[1];

    try {
      const decoded = TokenManager.verifyAccessToken(token);
      req.userId = decoded.userId;
      req.email = decoded.email;
      req.role = decoded.role;
      req.token = token;
      req.decodedToken = decoded;
      next();
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: error.message || 'Invalid or expired token',
          statusCode: 401,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error',
        statusCode: 500,
      },
    });
  }
};

// ===== ADMIN-ONLY MIDDLEWARE =====
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, () => {
    if (req.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Admin access required',
          statusCode: 403,
        },
      });
    }
    next();
  });
};

// ===== OPTIONAL AUTH MIDDLEWARE =====
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        try {
          const decoded = TokenManager.verifyAccessToken(parts[1]);
          req.userId = decoded.userId;
          req.email = decoded.email;
          req.role = decoded.role;
          req.token = parts[1];
          req.decodedToken = decoded;
        } catch {
          // Token invalid, but we don't fail - continue as unauthenticated
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export default {
  PasswordValidator,
  TokenManager,
  PasswordManager,
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware,
};
