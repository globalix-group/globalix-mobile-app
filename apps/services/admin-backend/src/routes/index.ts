import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { PropertyController } from '../controllers/propertyController';
import { CarController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import adminRoutes from './adminRoutes';

const router = Router();

// ===== ADMIN ROUTES =====
// Admin dashboard and monitoring - protected routes
router.use('/admin/api', adminRoutes);

// ===== AUTH ROUTES =====
router.post(
  '/auth/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  AuthController.login
);

router.post(
  '/auth/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty().trim(),
  ],
  AuthController.register
);

router.post('/auth/refresh', AuthController.refreshToken);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/apple-callback', AuthController.appleSignIn);
router.post('/auth/google-callback', AuthController.googleSignIn);
router.post('/auth/logout', authMiddleware, AuthController.logout);

// ===== PROPERTY ROUTES =====
router.get('/properties', PropertyController.getProperties);
router.get('/properties/categories', PropertyController.getPropertyCategories);
router.get('/properties/map', PropertyController.getPropertiesForMap);
router.get('/properties/search', PropertyController.searchProperties);
router.get('/properties/:id', PropertyController.getPropertyById);

router.post('/properties', authMiddleware, PropertyController.createProperty);
router.put('/properties/:id', authMiddleware, PropertyController.updateProperty);
router.delete('/properties/:id', authMiddleware, PropertyController.deleteProperty);

// ===== CAR ROUTES =====
router.get('/cars', CarController.getCars);
router.get('/cars/categories', CarController.getCarCategories);
router.get('/cars/search', CarController.searchCars);
router.get('/cars/:id', CarController.getCarById);

router.post('/cars', authMiddleware, CarController.createCar);
router.put('/cars/:id', authMiddleware, CarController.updateCar);
router.delete('/cars/:id', authMiddleware, CarController.deleteCar);

export default router;
