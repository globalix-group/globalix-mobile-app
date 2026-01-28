import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Demo endpoints that work without database

// ===== HEALTH & INFO =====
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Globalix Real Estate API',
      version: '1.0.0',
      status: 'running',
      endpoints: 35,
      database: 'PostgreSQL (requires setup)',
    },
  });
});

// ===== AUTHENTICATION ROUTES (DEMO) =====
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password required', statusCode: 400 },
    });
  }
  res.json({
    success: true,
    data: {
      user: { id: 'demo-user-123', email, name: 'Demo User' },
      token: 'demo-jwt-token-xxx.yyy.zzz',
      refreshToken: 'demo-refresh-token-xxx.yyy.zzz',
    },
  });
});

router.post('/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email, password, and name required', statusCode: 400 },
    });
  }
  res.status(201).json({
    success: true,
    data: { id: 'demo-user-456', email, name },
  });
});

router.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Refresh token required', statusCode: 400 },
    });
  }
  res.json({
    success: true,
    data: {
      token: 'new-jwt-token-xxx.yyy.zzz',
      user: { id: 'demo-user-123', email: 'demo@example.com', name: 'Demo User' },
    },
  });
});

// ===== PROPERTY ROUTES (DEMO) =====
router.get('/properties', (req, res) => {
  res.json({
    success: true,
    data: {
      total: 3,
      page: 1,
      pages: 1,
      data: [
        {
          id: 'prop-001',
          title: 'Luxury Penthouse',
          location: 'New York, NY',
          price: 5000000,
          beds: 4,
          baths: 3,
          sqft: 5000,
          type: 'Penthouses',
          status: 'Available',
        },
        {
          id: 'prop-002',
          title: 'Modern Villa',
          location: 'Los Angeles, CA',
          price: 3500000,
          beds: 5,
          baths: 4,
          sqft: 6000,
          type: 'Villas',
          status: 'Available',
        },
        {
          id: 'prop-003',
          title: 'Downtown Estate',
          location: 'Miami, FL',
          price: 2800000,
          beds: 3,
          baths: 2,
          sqft: 3500,
          type: 'Estates',
          status: 'Available',
        },
      ],
    },
  });
});

router.get('/properties/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: {
      id,
      title: 'Luxury Penthouse',
      description: 'Beautiful luxury penthouse with panoramic views',
      location: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.006,
      price: 5000000,
      beds: 4,
      baths: 3,
      sqft: 5000,
      amenities: ['Pool', 'Gym', 'Garage', 'Garden'],
      type: 'Penthouses',
      status: 'Available',
      ownerId: 'user-123',
    },
  });
});

router.get('/properties/categories', (req, res) => {
  res.json({
    success: true,
    data: ['Penthouses', 'Villas', 'Estates', 'Commercial', 'Condos'],
  });
});

// ===== CAR ROUTES (DEMO) =====
router.get('/cars', (req, res) => {
  res.json({
    success: true,
    data: {
      total: 3,
      page: 1,
      pages: 1,
      data: [
        {
          id: 'car-001',
          name: 'Ferrari 488 GTB',
          brand: 'Ferrari',
          model: '488 GTB',
          year: 2023,
          price: 280000,
          pricePerDay: 1500,
          category: 'Luxury',
          availability: true,
        },
        {
          id: 'car-002',
          name: 'Lamborghini Huracán',
          brand: 'Lamborghini',
          model: 'Huracán',
          year: 2023,
          price: 250000,
          pricePerDay: 1200,
          category: 'SuperCar',
          availability: true,
        },
        {
          id: 'car-003',
          name: 'Porsche 911 Turbo',
          brand: 'Porsche',
          model: '911 Turbo',
          year: 2023,
          price: 200000,
          pricePerDay: 1000,
          category: 'Sports',
          availability: true,
        },
      ],
    },
  });
});

router.get('/cars/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: {
      id,
      name: 'Ferrari 488 GTB',
      brand: 'Ferrari',
      model: '488 GTB',
      year: 2023,
      price: 280000,
      pricePerDay: 1500,
      specs: '3.9L Twin-Turbo V8, 661 HP, 0-60 in 2.9s',
      features: ['Leather Seats', 'GPS', 'Premium Audio', 'Carbon Fiber'],
      category: 'Luxury',
      availability: true,
      ownerId: 'user-123',
    },
  });
});

router.get('/cars/categories', (req, res) => {
  res.json({
    success: true,
    data: ['Luxury', 'SuperCar', 'Sports', 'Sedan', 'SUV'],
  });
});

// ===== USER ROUTES (DEMO) =====
router.get('/user/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.userId || 'demo-user-123',
      email: 'user@example.com',
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      phone: '+1 (555) 123-4567',
      bio: 'Luxury property and car enthusiast',
      preferences: { theme: 'dark', notifications: true },
    },
  });
});

// ===== CONTACTS (DEMO) =====
router.post('/contacts', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Name, email, and message required', statusCode: 400 },
    });
  }
  res.status(201).json({
    success: true,
    data: { id: 'contact-123', name, email, phone, message, isResolved: false },
  });
});

// Catch-all for endpoints that require database
router.all('*', (req, res) => {
  res.status(503).json({
    success: false,
    error: {
      code: 'DATABASE_REQUIRED',
      message: 'This endpoint requires PostgreSQL database connection. Install PostgreSQL to enable full functionality.',
      statusCode: 503,
    },
  });
});

export default router;
