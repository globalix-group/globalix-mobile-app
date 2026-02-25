import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  private static requireSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): Secret {
    const value = process.env[name];
    if (!value) {
      throw new AppError(500, 'CONFIG_MISSING', `${name} is not configured`);
    }
    return value as Secret;
  }
  static async register(tenantId: string, email: string, password: string, name: string) {
    const existingUser = await User.findOne({ where: { email, tenantId } });
    if (existingUser) {
      throw new AppError(400, 'USER_EXISTS', 'User with this email already exists');
    }

    const user = await User.create({
      tenantId,
      email,
      password,
      name,
      isEmailVerified: false,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  static async login(tenantId: string, email: string, password: string) {
    const user = await User.findOne({ where: { email, tenantId } });
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const jwtSecret = AuthService.requireSecret('JWT_SECRET');
    const refreshSecret = AuthService.requireSecret('JWT_REFRESH_SECRET');
    const tokenExpiry = (process.env.JWT_EXPIRY || '1h') as SignOptions['expiresIn'];
    const refreshExpiry = (process.env.JWT_REFRESH_EXPIRY || '7d') as SignOptions['expiresIn'];
    const tokenOptions: SignOptions = { expiresIn: tokenExpiry };
    const refreshOptions: SignOptions = { expiresIn: refreshExpiry };

    const token = jwt.sign({ userId: user.id, tenantId }, jwtSecret, tokenOptions);
    const refreshToken = jwt.sign({ userId: user.id, tenantId }, refreshSecret, refreshOptions);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
      refreshToken,
    };
  }

  static async refreshToken(tenantId: string, refreshToken: string) {
    try {
      const refreshSecret = AuthService.requireSecret('JWT_REFRESH_SECRET');
      const decoded = jwt.verify(refreshToken, refreshSecret) as { userId: string; tenantId?: string };
      if (decoded.tenantId && decoded.tenantId !== tenantId) {
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
      }
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        throw new AppError(401, 'USER_NOT_FOUND', 'User not found');
      }

      const jwtSecret = AuthService.requireSecret('JWT_SECRET');
      const tokenExpiry = (process.env.JWT_EXPIRY || '1h') as SignOptions['expiresIn'];
      const tokenOptions: SignOptions = { expiresIn: tokenExpiry };
      const newToken = jwt.sign({ userId: user.id, tenantId }, jwtSecret, tokenOptions);

      return {
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
    }
  }

  static async forgotPassword(tenantId: string, email: string) {
    const user = await User.findOne({ where: { email, tenantId } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User with this email not found');
    }

    const jwtSecret = AuthService.requireSecret('JWT_SECRET');
    const resetOptions: SignOptions = { expiresIn: '1h' as SignOptions['expiresIn'] };
    const resetToken = jwt.sign({ userId: user.id, tenantId }, jwtSecret, resetOptions);

    return {
      email: user.email,
      resetToken,
    };
  }

  static async appleSignIn(tenantId: string, appleId: string, email: string, name: string) {
    let user = await User.findOne({ where: { email, tenantId } });

    if (!user) {
      user = await User.create({
        tenantId,
        email,
        name,
        isEmailVerified: true,
      });
    }

    const jwtSecret = AuthService.requireSecret('JWT_SECRET');
    const tokenExpiry = (process.env.JWT_EXPIRY || '1h') as SignOptions['expiresIn'];
    const tokenOptions: SignOptions = { expiresIn: tokenExpiry };
    const token = jwt.sign({ userId: user.id, tenantId }, jwtSecret, tokenOptions);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  static async googleSignIn(tenantId: string, googleId: string, email: string, name: string, avatar?: string) {
    let user = await User.findOne({ where: { email, tenantId } });

    if (!user) {
      user = await User.create({
        tenantId,
        email,
        name,
        avatar: avatar || undefined,
        isEmailVerified: true,
      });
    }

    const jwtSecret = AuthService.requireSecret('JWT_SECRET');
    const tokenExpiry = (process.env.JWT_EXPIRY || '1h') as SignOptions['expiresIn'];
    const tokenOptions: SignOptions = { expiresIn: tokenExpiry };
    const token = jwt.sign({ userId: user.id, tenantId }, jwtSecret, tokenOptions);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    };
  }
}
