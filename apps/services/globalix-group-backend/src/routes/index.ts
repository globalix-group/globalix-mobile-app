import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import { validateRequest } from '../middleware/validate';
import { AuthController } from '../controllers/authController';
import { PropertyController } from '../controllers/propertyController';
import { CarController } from '../controllers/carController';
import { ActivityController } from '../controllers/activityController';
import { tenantContext } from '../middleware/tenantContext';
import { enforceListingLimits } from '../middleware/planEnforcement';
import billingRoutes from './billing';
import aiInsightRoutes from './aiInsights';
import {
  UserController,
  InquiryController,
  NotificationController,
  ContactController,
  CarReservationController,
  ChatController,
} from '../controllers/index';

const router = Router();

// Resolve tenant context for all API routes
router.use(tenantContext);

// ===== BILLING & AI ROUTES =====
router.use('/billing', billingRoutes);
router.use('/ai', aiInsightRoutes);

// ===== AUTHENTICATION ROUTES =====
router.post(
  '/auth/login',
  validateRequest([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ]),
  AuthController.login
);
router.post(
  '/auth/register',
  validateRequest([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').notEmpty().trim(),
  ]),
  AuthController.register
);
router.post(
  '/auth/refresh',
  validateRequest([body('refreshToken').notEmpty()]),
  AuthController.refresh
);
router.post(
  '/auth/forgot-password',
  validateRequest([body('email').isEmail().normalizeEmail()]),
  AuthController.forgotPassword
);
router.post(
  '/auth/apple-callback',
  validateRequest([
    body('appleId').notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('name').optional().isString(),
  ]),
  AuthController.appleCallback
);
router.post(
  '/auth/google-callback',
  validateRequest([
    body('googleId').notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('name').optional().isString(),
  ]),
  AuthController.googleCallback
);
router.post('/auth/logout', authMiddleware, AuthController.logout);

// ===== ACTIVITY LOGGING ROUTES =====
router.post(
  '/activities/log',
  authMiddleware,
  validateRequest([
    body('action').notEmpty(),
    body('type').notEmpty(),
  ]),
  ActivityController.logActivity
);
router.get('/activities', adminAuthMiddleware, ActivityController.getActivities);

// ===== PROPERTY ROUTES =====
router.get('/properties', PropertyController.getProperties);
router.get('/properties/map', PropertyController.getPropertiesForMap);
router.get('/properties/categories', PropertyController.getCategories);
router.get('/properties/search', PropertyController.searchProperties);
router.get('/properties/:id', PropertyController.getPropertyById);
router.post(
  '/properties',
  authMiddleware,
  enforceListingLimits,
  validateRequest([
    body('title').notEmpty().isString().trim(),
    body('location').notEmpty().isString().trim(),
    body('price').isNumeric(),
    body('type').isIn(['Penthouses', 'Villas', 'Estates', 'Commercial', 'Condos']),
    body('description').optional().isString(),
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat(),
    body('beds').optional().isInt(),
    body('baths').optional().isInt(),
    body('sqft').optional().isInt(),
    body('images').optional().isArray(),
    body('images.*').optional().isString(),
    body('amenities').optional().isArray(),
    body('amenities.*').optional().isString(),
    body('status').optional().isIn(['Available', 'Sold', 'Rented', 'Reserved']),
  ]),
  PropertyController.createProperty
);
router.put(
  '/properties/:id',
  authMiddleware,
  validateRequest([
    body('title').optional().isString().trim(),
    body('location').optional().isString().trim(),
    body('price').optional().isNumeric(),
    body('type').optional().isIn(['Penthouses', 'Villas', 'Estates', 'Commercial', 'Condos']),
    body('description').optional().isString(),
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat(),
    body('beds').optional().isInt(),
    body('baths').optional().isInt(),
    body('sqft').optional().isInt(),
    body('images').optional().isArray(),
    body('images.*').optional().isString(),
    body('amenities').optional().isArray(),
    body('amenities.*').optional().isString(),
    body('status').optional().isIn(['Available', 'Sold', 'Rented', 'Reserved']),
  ]),
  PropertyController.updateProperty
);
router.delete('/properties/:id', authMiddleware, PropertyController.deleteProperty);

// ===== CAR ROUTES =====
router.get('/cars', CarController.getCars);
router.get('/cars/categories', CarController.getCategories);
router.get('/cars/search', CarController.searchCars);
router.get('/cars/:id', CarController.getCarById);
router.post(
  '/cars',
  authMiddleware,
  enforceListingLimits,
  validateRequest([
    body('name').notEmpty().isString().trim(),
    body('brand').notEmpty().isString().trim(),
    body('model').notEmpty().isString().trim(),
    body('year').isInt(),
    body('price').isNumeric(),
    body('pricePerDay').optional().isNumeric(),
    body('specs').optional().isString(),
    body('images').optional().isArray(),
    body('images.*').optional().isString(),
    body('features').optional().isArray(),
    body('features.*').optional().isString(),
    body('category').optional().isString().trim(),
    body('availability').optional().isBoolean(),
  ]),
  CarController.createCar
);
router.put(
  '/cars/:id',
  authMiddleware,
  validateRequest([
    body('name').optional().isString().trim(),
    body('brand').optional().isString().trim(),
    body('model').optional().isString().trim(),
    body('year').optional().isInt(),
    body('price').optional().isNumeric(),
    body('pricePerDay').optional().isNumeric(),
    body('specs').optional().isString(),
    body('images').optional().isArray(),
    body('images.*').optional().isString(),
    body('features').optional().isArray(),
    body('features.*').optional().isString(),
    body('category').optional().isString().trim(),
    body('availability').optional().isBoolean(),
  ]),
  CarController.updateCar
);
router.delete('/cars/:id', authMiddleware, CarController.deleteCar);

// ===== USER ROUTES =====
router.get('/users', adminAuthMiddleware, UserController.getAllUsers);
router.get('/user/profile', authMiddleware, UserController.getProfile);
router.put(
  '/user/profile',
  authMiddleware,
  validateRequest([
    body('name').optional().isString().trim().isLength({ max: 200 }),
    body('phone').optional().isString().trim().isLength({ max: 50 }),
    body('bio').optional().isString().trim().isLength({ max: 2000 }),
    body('avatar').optional().isString().isLength({ max: 2048 }),
  ]),
  UserController.updateProfile
);
router.put('/user/preferences', authMiddleware, UserController.updatePreferences);
router.delete('/users/:id', authMiddleware, UserController.deleteUser);

// ===== INQUIRY ROUTES =====
router.post(
  '/inquiries',
  authMiddleware,
  validateRequest([
    body('propertyId').isUUID(),
    body('message').notEmpty().isString().trim().isLength({ max: 2000 }),
  ]),
  InquiryController.createInquiry
);
router.get('/inquiries', authMiddleware, InquiryController.getUserInquiries);
router.put(
  '/inquiries/:id',
  authMiddleware,
  validateRequest([
    body('message').optional().isString().trim().isLength({ max: 2000 }),
  ]),
  InquiryController.updateInquiry
);

// ===== NOTIFICATION ROUTES =====
router.get('/notifications', authMiddleware, NotificationController.getNotifications);
router.put('/notifications/:id/read', authMiddleware, NotificationController.markAsRead);

// ===== CONTACT ROUTES =====
router.post(
  '/contacts',
  validateRequest([
    body('name').notEmpty().isString().trim().isLength({ max: 200 }),
    body('email').isEmail().normalizeEmail().isLength({ max: 320 }),
    body('message').notEmpty().isString().trim().isLength({ max: 2000 }),
    body('phone').optional().isString().trim().isLength({ max: 50 }),
  ]),
  ContactController.createContact
);
router.get('/contacts', adminAuthMiddleware, ContactController.getContacts);

// ===== CAR RESERVATION ROUTES =====
router.post(
  '/reservations',
  authMiddleware,
  validateRequest([
    body('carId').isUUID(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('totalPrice').isNumeric(),
  ]),
  CarReservationController.createReservation
);
router.get('/reservations', authMiddleware, CarReservationController.getUserReservations);
router.put(
  '/reservations/:id',
  authMiddleware,
  validateRequest([
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('totalPrice').optional().isNumeric(),
  ]),
  CarReservationController.updateReservation
);

// ===== CHAT ROUTES =====
// User chat endpoints
router.get('/chats', authMiddleware, ChatController.getUserChats);
router.post(
  '/chats',
  authMiddleware,
  validateRequest([
    body('message').notEmpty().trim().isLength({ max: 2000 }),
  ]),
  ChatController.sendMessage
);
router.put('/chats/read', authMiddleware, ChatController.markAsRead);
router.get('/chats/unread', authMiddleware, ChatController.getUnreadCount);
router.delete('/chats', authMiddleware, ChatController.clearUserChats);

// Admin chat endpoints
router.get('/admin/chats', adminAuthMiddleware, ChatController.getAllUserChats);
router.post(
  '/admin/chats',
  adminAuthMiddleware,
  validateRequest([
    body('userId').isUUID(),
    body('message').notEmpty().trim().isLength({ max: 2000 }),
  ]),
  ChatController.adminSendMessage
);

export default router;
