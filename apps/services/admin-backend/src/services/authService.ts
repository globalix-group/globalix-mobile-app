import { User } from '../models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthService {
  static generateTokens(userId: string) {
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRY || '1h' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    return { token, refreshToken };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw {
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      };
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw {
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      };
    }

    const { token, refreshToken } = this.generateTokens(user.id);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }

  static async register(email: string, password: string, name: string) {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw {
        statusCode: 409,
        code: 'AUTH_EMAIL_EXISTS',
        message: 'Email already registered',
      };
    }

    const user = await User.create({
      email,
      password,
      name,
    });

    const { token, refreshToken } = this.generateTokens(user.id);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh_secret'
      ) as any;

      const user = await User.findByPk(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      const { token, refreshToken: newRefreshToken } = this.generateTokens(user.id);

      return {
        token,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw {
        statusCode: 401,
        code: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token',
      };
    }
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If email exists, password reset link sent' };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { message: 'Password reset email sent' };
  }

  static async appleSignIn(identityToken: string) {
    // In production, validate Apple identity token
    // For now, create or get user from Apple ID
    // This should be implemented with proper Apple token validation

    return {
      message: 'Apple Sign-In - not yet fully implemented',
    };
  }

  static async googleSignIn(idToken: string) {
    // In production, validate Google ID token
    // For now, create or get user from Google ID
    // This should be implemented with proper Google token validation

    return {
      message: 'Google Sign-In - not yet fully implemented',
    };
  }
}
