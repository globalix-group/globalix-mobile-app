import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  static async register(email: string, password: string, name: string) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'USER_EXISTS', 'User with this email already exists');
    }

    const user = await User.create({
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

  static async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const jwtSecret = (process.env.JWT_SECRET || 'secret') as Secret;
    const refreshSecret = (process.env.JWT_REFRESH_SECRET || 'refresh') as Secret;
    const tokenExpiry = (process.env.JWT_EXPIRY || '1h') as SignOptions['expiresIn'];
    const refreshExpiry = (process.env.JWT_REFRESH_EXPIRY || '7d') as SignOptions['expiresIn'];
    const tokenOptions: SignOptions = { expiresIn: tokenExpiry };
    const refreshOptions: SignOptions = { expiresIn: refreshExpiry };

    const token = jwt.sign({ userId: user.id }, jwtSecret, tokenOptions);
    const refreshToken = jwt.sign({ userId: user.id }, refreshSecret, refreshOptions);

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

  static async refreshToken(refreshToken: string) {
    try {
      const refreshSecret = (process.env.JWT_REFRESH_SECRET || 'refresh') as Secret;
      const decoded = jwt.verify(refreshToken, refreshSecret) as { userId: string };
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        throw new AppError(401, 'USER_NOT_FOUND', 'User not found');
      }

      const jwtSecret = (process.env.JWT_SECRET || 'secret') as Secret;
      const tokenExpiry = (process.env.JWT_EXPIRY || '1h') as SignOptions['expiresIn'];
      const tokenOptions: SignOptions = { expiresIn: tokenExpiry };
      const newToken = jwt.sign({ userId: user.id }, jwtSecret, tokenOptions);

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

  static async forgotPassword(email: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User with this email not found');
    }

    const jwtSecret = (process.env.JWT_SECRET || 'secret') as Secret;
    const resetOptions: SignOptions = { expiresIn: '1h' as SignOptions['expiresIn'] };
    const resetToken = jwt.sign({ userId: user.id }, jwtSecret, resetOptions);

    return {
      email: user.email,
      resetToken,
    };
  }

  static async appleSignIn(appleId: string, email: string, name: string) {
    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        email,
        name,
        isEmailVerified: true,
      });
    }

    const jwtSecret = (process.env.JWT_SECRET || 'secret') as Secret;
    const tokenExpiry = (process.env.JWT_EXPIRY || '1h') as SignOptions['expiresIn'];
    const tokenOptions: SignOptions = { expiresIn: tokenExpiry };
    const token = jwt.sign({ userId: user.id }, jwtSecret, tokenOptions);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  static async googleSignIn(googleId: string, email: string, name: string, avatar?: string) {
    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        email,
        name,
        avatar: avatar || undefined,
        isEmailVerified: true,
      });
    }

    const jwtSecret = (process.env.JWT_SECRET || 'secret') as Secret;
    const tokenExpiry = (process.env.JWT_EXPIRY || '1h') as SignOptions['expiresIn'];
    const tokenOptions: SignOptions = { expiresIn: tokenExpiry };
    const token = jwt.sign({ userId: user.id }, jwtSecret, tokenOptions);

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
