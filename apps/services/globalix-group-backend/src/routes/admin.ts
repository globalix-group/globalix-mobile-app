import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const adminRouter = express.Router();

// Mock admin users (in production, query from database)
const adminUsers = [
  {
    id: '1',
    email: 'admin@globalix.com',
    password: '$2b$10$YourHashedPasswordHere', // Password: admin123
    name: 'Admin User',
    role: 'superadmin',
  },
];

// Mock activity logs
const activityLogs = [
  { id: '1', userId: 'user1', type: 'login', action: 'User logged in', timestamp: new Date(Date.now() - 5 * 60000), metadata: { ipAddress: '192.168.1.1' } },
  { id: '2', userId: 'user2', type: 'signup', action: 'New user registered', timestamp: new Date(Date.now() - 15 * 60000), metadata: { email: 'user@example.com' } },
  { id: '3', userId: 'user3', type: 'property_view', action: 'Viewed property listing', timestamp: new Date(Date.now() - 30 * 60000), metadata: { propertyId: 'prop1' } },
  { id: '4', userId: 'user4', type: 'car_view', action: 'Viewed car listing', timestamp: new Date(Date.now() - 45 * 60000), metadata: { carId: 'car1' } },
  { id: '5', userId: 'user5', type: 'inquiry', action: 'Submitted inquiry', timestamp: new Date(Date.now() - 60 * 60000), metadata: { inquiryId: 'inq1' } },
];

// Mock transactions (earnings)
const transactions = [
  { id: 'txn1', userId: 'user1', type: 'property_sale', amount: 5000, currency: 'USD', status: 'completed', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60000) },
  { id: 'txn2', userId: 'user2', type: 'car_rental', amount: 150, currency: 'USD', status: 'completed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000) },
  { id: 'txn3', userId: 'user3', type: 'commission', amount: 500, currency: 'USD', status: 'pending', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000) },
  { id: 'txn4', userId: 'user4', type: 'property_sale', amount: 3500, currency: 'USD', status: 'completed', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000) },
];

// Mock dashboard stats
const dashboardStats = {
  totalUsers: 1250,
  activeUsers: 380,
  totalEarnings: 125400.50,
  totalInquiries: 450,
  newSignups: 45,
  totalLogins: 8900,
};

// ===== ADMIN LOGIN =====
adminRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For demo purposes, accept specific credentials
    if (email === 'admin@globalix.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: '1', email: 'admin@globalix.com', role: 'superadmin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        token,
        admin: {
          id: '1',
          email: 'admin@globalix.com',
          name: 'Admin User',
          role: 'superadmin',
        },
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ===== GET DASHBOARD STATS =====
adminRouter.get('/dashboard', (req: Request, res: Response) => {
  try {
    return res.json({
      stats: dashboardStats,
      lastUpdated: new Date(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ===== GET ACTIVITY LOGS =====
adminRouter.get('/activity', (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, type, startDate, endDate } = req.query;

    let filtered = [...activityLogs];

    // Filter by type
    if (type) {
      filtered = filtered.filter((log) => log.type === type);
    }

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp);
        if (startDate && logDate < new Date(startDate as string)) return false;
        if (endDate && logDate > new Date(endDate as string)) return false;
        return true;
      });
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Paginate
    const paginatedLogs = filtered.slice(Number(offset), Number(offset) + Number(limit));

    return res.json({
      total: filtered.length,
      limit: Number(limit),
      offset: Number(offset),
      activities: paginatedLogs,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ===== GET EARNINGS/TRANSACTIONS =====
adminRouter.get('/earnings', (req: Request, res: Response) => {
  try {
    const { period = 'all' } = req.query; // all, today, week, month

    let filtered = [...transactions];

    // Filter by period
    if (period !== 'all') {
      const now = new Date();
      const day = 1000 * 60 * 60 * 24;

      if (period === 'today') {
        filtered = filtered.filter((t) => new Date(t.timestamp).getTime() > now.getTime() - day);
      } else if (period === 'week') {
        filtered = filtered.filter((t) => new Date(t.timestamp).getTime() > now.getTime() - 7 * day);
      } else if (period === 'month') {
        filtered = filtered.filter((t) => new Date(t.timestamp).getTime() > now.getTime() - 30 * day);
      }
    }

    const totalEarnings = filtered.reduce((sum, t) => sum + Number(t.amount), 0);
    const completedEarnings = filtered
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const pendingEarnings = filtered
      .filter((t) => t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return res.json({
      period,
      totalEarnings,
      completedEarnings,
      pendingEarnings,
      transactionCount: filtered.length,
      transactions: filtered,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ===== GET ANALYTICS DATA FOR CHARTS =====
adminRouter.get('/analytics', (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    // Generate demo analytics data for chart
    const chartData = [];
    const now = new Date();

    for (let i = Number(days) - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      chartData.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100) + 20,
        earnings: Math.floor(Math.random() * 5000) + 500,
        inquiries: Math.floor(Math.random() * 50) + 5,
        logins: Math.floor(Math.random() * 200) + 50,
      });
    }

    return res.json({
      period: `Last ${days} days`,
      data: chartData,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ===== GET USERS LIST =====
adminRouter.get('/users', (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0, search } = req.query;

    const mockUsers = [
      { id: 'user1', name: 'John Doe', email: 'john@example.com', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60000), status: 'active' },
      { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date(Date.now() - 20 * 24 * 60 * 60000), status: 'active' },
      { id: 'user3', name: 'Bob Johnson', email: 'bob@example.com', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60000), status: 'inactive' },
      { id: 'user4', name: 'Alice Williams', email: 'alice@example.com', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000), status: 'active' },
      { id: 'user5', name: 'Charlie Brown', email: 'charlie@example.com', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60000), status: 'active' },
    ];

    let filtered = [...mockUsers];

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes((search as string).toLowerCase()) ||
          u.email.toLowerCase().includes((search as string).toLowerCase())
      );
    }

    const paginatedUsers = filtered.slice(Number(offset), Number(offset) + Number(limit));

    return res.json({
      total: filtered.length,
      limit: Number(limit),
      offset: Number(offset),
      users: paginatedUsers,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ===== GET SIGN IN/SIGN UP STATISTICS =====
adminRouter.get('/auth-stats', (req: Request, res: Response) => {
  void req;
  try {
    const signups = activityLogs.filter((log) => log.type === 'signup');
    const logins = activityLogs.filter((log) => log.type === 'login');

    return res.json({
      totalSignups: signups.length,
      totalLogins: logins.length,
      recentSignups: signups.slice(0, 5),
      recentLogins: logins.slice(0, 5),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default adminRouter;
