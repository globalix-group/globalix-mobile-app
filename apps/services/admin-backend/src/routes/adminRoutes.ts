import { Router } from 'express';
import { body } from 'express-validator';
import { AdminController } from '../controllers/adminController';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = Router();

// ===== ADMIN AUTH ROUTES =====
// Login - accessible to anyone with admin credentials
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  AdminController.login
);

// ===== PROTECTED ADMIN ROUTES =====
// All routes below require valid admin token

// Dashboard
router.get('/dashboard', adminAuthMiddleware, AdminController.getDashboard);

// Activity Logs - view all app activity and user movements
// Temporarily disabled auth for testing
router.get('/activity', AdminController.getActivity);

// Earnings - view platform earnings
router.get('/earnings', adminAuthMiddleware, AdminController.getEarnings);

// Analytics - view analytics and metrics
router.get('/analytics', adminAuthMiddleware, AdminController.getAnalytics);

// Users - view all users
router.get('/users', adminAuthMiddleware, AdminController.getUsers);

// Auth Stats - view authentication events
router.get('/auth-stats', adminAuthMiddleware, AdminController.getAuthStats);

export default router;
