import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Hardcoded admin credentials (In production, this would be in a database)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@globalix.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = '7d';
const GLOBALIX_BACKEND_URL = process.env.GLOBALIX_BACKEND_URL || 'http://localhost:3002';

export const AdminController = {
  /**
   * Admin Login
   * Only the admin with specific credentials can access the dashboard
   */
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Check if credentials match admin account
      if (email !== ADMIN_EMAIL) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { email: ADMIN_EMAIL, role: 'admin' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      res.json({
        token,
        admin: {
          email: ADMIN_EMAIL,
          role: 'admin',
          name: 'Admin',
        },
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  /**
   * Get Dashboard Stats
   * Displays app activity, user counts, and system health
   */
  getDashboard: async (req: Request, res: Response) => {
    try {
      // These would come from database queries in production
      const stats = {
        totalUsers: 0,
        activeUsers: 0,
        totalProperties: 0,
        totalCars: 0,
        totalEarnings: 0,
        lastUpdated: new Date(),
      };

      res.json(stats);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
  },

  /**
   * Get Activity Logs
   * Shows who enters the app and user movements
   * Fetches from globalix-group-backend where activities are logged
   */
  getActivity: async (req: Request, res: Response) => {
    try {
      const { limit = 50, offset = 0, type } = req.query;
      const url = `${GLOBALIX_BACKEND_URL}/api/v1/activities?limit=${limit}&offset=${offset}${type ? `&type=${type}` : ''}`;
      
      console.log('📡 Fetching activities from:', url);

      // Fetch activities from globalix-group-backend
      const response = await fetch(url);
      
      console.log('📊 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.warn('❌ Failed to fetch activities from globalix-group-backend:', response.statusText);
        return res.json({
          data: [],
          total: 0,
          limit: Number(limit),
          offset: Number(offset),
        });
      }

      const data = await response.json();
      console.log('✅ Activities received:', data);
      
      // Return the activities in the expected format
      res.json({
        data: data.data || [],
        total: data.total || 0,
        limit: Number(limit),
        offset: Number(offset),
      });
    } catch (error) {
      console.error('Activity error:', error);
      res.json({
        data: [],
        total: 0,
        limit: 50,
        offset: 0,
      });
    }
  },

  /**
   * Get Earnings Report
   * Shows platform earnings and revenue analytics
   */
  getEarnings: async (req: Request, res: Response) => {
    try {
      const { period = 'month' } = req.query;

      const earnings = {
        total: 0,
        period,
        breakdown: [],
        timestamp: new Date(),
      };

      res.json(earnings);
    } catch (error) {
      console.error('Earnings error:', error);
      res.status(500).json({ error: 'Failed to fetch earnings' });
    }
  },

  /**
   * Get Analytics
   * Shows platform metrics and trends
   */
  getAnalytics: async (req: Request, res: Response) => {
    try {
      const { days = 30 } = req.query;

      const analytics = {
        period: days,
        metrics: [],
        trends: [],
        timestamp: new Date(),
      };

      res.json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  /**
   * Get Users List
   * Shows all users with their activity status
   */
  getUsers: async (req: Request, res: Response) => {
    try {
      const { limit = 50, offset = 0, search } = req.query;

      // This would query users from database
      const users = [];

      res.json({
        data: users,
        total: 0,
        limit: Number(limit),
        offset: Number(offset),
      });
    } catch (error) {
      console.error('Users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  /**
   * Get Authentication Stats
   * Shows login attempts, account creations, and auth events
   */
  getAuthStats: async (req: Request, res: Response) => {
    try {
      const stats = {
        loginAttempts: 0,
        successfulLogins: 0,
        failedLogins: 0,
        newAccounts: 0,
        activeNow: 0,
        lastUpdated: new Date(),
      };

      res.json(stats);
    } catch (error) {
      console.error('Auth stats error:', error);
      res.status(500).json({ error: 'Failed to fetch auth stats' });
    }
  },
};
