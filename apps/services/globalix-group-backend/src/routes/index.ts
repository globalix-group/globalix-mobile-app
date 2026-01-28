import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AuthController } from '../controllers/authController';
import { PropertyController } from '../controllers/propertyController';
import { CarController } from '../controllers/carController';
import { ActivityController } from '../controllers/activityController';
import {
  UserController,
  InquiryController,
  NotificationController,
  ContactController,
  CarReservationController,
} from '../controllers/index';

const router = Router();

// ===== AUTHENTICATION ROUTES =====
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/refresh', AuthController.refresh);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/apple-callback', AuthController.appleCallback);
router.post('/auth/google-callback', AuthController.googleCallback);
router.post('/auth/logout', authMiddleware, AuthController.logout);

// ===== ACTIVITY LOGGING ROUTES =====
router.post('/activities/log', ActivityController.logActivity);
router.get('/activities', ActivityController.getActivities);

// ===== PROPERTY ROUTES =====
router.get('/properties', PropertyController.getProperties);
router.get('/properties/map', PropertyController.getPropertiesForMap);
router.get('/properties/categories', PropertyController.getCategories);
router.get('/properties/search', PropertyController.searchProperties);
router.get('/properties/:id', PropertyController.getPropertyById);
router.post('/properties', authMiddleware, PropertyController.createProperty);
router.put('/properties/:id', authMiddleware, PropertyController.updateProperty);
router.delete('/properties/:id', authMiddleware, PropertyController.deleteProperty);

// ===== CAR ROUTES =====
router.get('/cars', CarController.getCars);
router.get('/cars/categories', CarController.getCategories);
router.get('/cars/search', CarController.searchCars);
router.get('/cars/:id', CarController.getCarById);
router.post('/cars', authMiddleware, CarController.createCar);
router.put('/cars/:id', authMiddleware, CarController.updateCar);
router.delete('/cars/:id', authMiddleware, CarController.deleteCar);

// ===== USER ROUTES =====
router.get('/user/profile', authMiddleware, UserController.getProfile);
router.put('/user/profile', authMiddleware, UserController.updateProfile);
router.put('/user/preferences', authMiddleware, UserController.updatePreferences);

// ===== INQUIRY ROUTES =====
router.post('/inquiries', authMiddleware, InquiryController.createInquiry);
router.get('/inquiries', authMiddleware, InquiryController.getUserInquiries);
router.put('/inquiries/:id', authMiddleware, InquiryController.updateInquiry);

// ===== NOTIFICATION ROUTES =====
router.get('/notifications', authMiddleware, NotificationController.getNotifications);
router.put('/notifications/:id/read', authMiddleware, NotificationController.markAsRead);

// ===== CONTACT ROUTES =====
router.post('/contacts', ContactController.createContact);
router.get('/contacts', ContactController.getContacts);

// ===== CAR RESERVATION ROUTES =====
router.post('/reservations', authMiddleware, CarReservationController.createReservation);
router.get('/reservations', authMiddleware, CarReservationController.getUserReservations);
router.put('/reservations/:id', authMiddleware, CarReservationController.updateReservation);

export default router;
