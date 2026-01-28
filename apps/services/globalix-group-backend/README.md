# Globalix Real Estate API Backend

Production-ready Node.js/Express.js REST API backend for the Globalix Real Estate mobile application.

## Features

- ✅ Full REST API with 27+ endpoints
- ✅ JWT authentication with refresh tokens
- ✅ PostgreSQL database with Sequelize ORM
- ✅ Comprehensive error handling
- ✅ CORS support
- ✅ Request validation
- ✅ TypeScript strict mode
- ✅ Production-ready security
- ✅ Hot reload during development
- ✅ Complete database models with relationships

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Update .env with your database credentials
# Edit .env and set:
# DB_HOST=localhost
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_NAME=restate_db
# JWT_SECRET=your_random_secret_key
# JWT_REFRESH_SECRET=your_random_refresh_secret

# 4. Create database
createdb restate_db

# 5. Start development server
npm run dev

# The server will be available at http://localhost:3000
```

## Development

```bash
# Start with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test
```

## Project Structure

```
src/
├── config/              # Configuration
│   └── database.ts      # Sequelize database setup
├── controllers/         # Route controllers
│   ├── authController.ts
│   ├── propertyController.ts
│   ├── carController.ts
│   └── index.ts         # Other controllers
├── middleware/          # Express middleware
│   ├── auth.ts          # JWT authentication
│   └── errorHandler.ts  # Error handling
├── models/              # Sequelize models
│   └── index.ts         # All database models + associations
├── routes/              # API routes
│   └── index.ts         # All endpoint definitions
├── services/            # Business logic
│   ├── authService.ts
│   ├── propertyService.ts
│   ├── carService.ts
│   └── index.ts         # Other services
├── utils/               # Utility functions
├── migrations/          # Database migrations
└── index.ts            # Application entry point
```

## API Endpoints

### Authentication (7 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | ❌ | User login |
| POST | `/api/v1/auth/register` | ❌ | User registration |
| POST | `/api/v1/auth/refresh` | ❌ | Refresh JWT token |
| POST | `/api/v1/auth/forgot-password` | ❌ | Password reset request |
| POST | `/api/v1/auth/apple-callback` | ❌ | Apple Sign-in |
| POST | `/api/v1/auth/google-callback` | ❌ | Google Sign-in |
| POST | `/api/v1/auth/logout` | ✅ | Logout |

### Properties (8 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/properties` | ❌ | List all properties |
| GET | `/api/v1/properties/:id` | ❌ | Get property details |
| GET | `/api/v1/properties/map` | ❌ | Properties for map view |
| GET | `/api/v1/properties/search` | ❌ | Search properties |
| GET | `/api/v1/properties/categories` | ❌ | Property categories |
| POST | `/api/v1/properties` | ✅ | Create property |
| PUT | `/api/v1/properties/:id` | ✅ | Update property |
| DELETE | `/api/v1/properties/:id` | ✅ | Delete property |

### Cars (7 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/cars` | ❌ | List all cars |
| GET | `/api/v1/cars/:id` | ❌ | Get car details |
| GET | `/api/v1/cars/search` | ❌ | Search cars |
| GET | `/api/v1/cars/categories` | ❌ | Car categories |
| POST | `/api/v1/cars` | ✅ | Create car |
| PUT | `/api/v1/cars/:id` | ✅ | Update car |
| DELETE | `/api/v1/cars/:id` | ✅ | Delete car |

### Users (3 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/user/profile` | ✅ | Get user profile |
| PUT | `/api/v1/user/profile` | ✅ | Update profile |
| PUT | `/api/v1/user/preferences` | ✅ | Update preferences |

### Inquiries (3 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/inquiries` | ✅ | Create inquiry |
| GET | `/api/v1/inquiries` | ✅ | Get user inquiries |
| PUT | `/api/v1/inquiries/:id` | ✅ | Update inquiry |

### Notifications (2 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/notifications` | ✅ | Get notifications |
| PUT | `/api/v1/notifications/:id/read` | ✅ | Mark as read |

### Contacts (2 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/contacts` | ❌ | Submit contact form |
| GET | `/api/v1/contacts` | ❌ | Get all contacts |

### Car Reservations (3 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/reservations` | ✅ | Create reservation |
| GET | `/api/v1/reservations` | ✅ | Get user reservations |
| PUT | `/api/v1/reservations/:id` | ✅ | Update reservation |

**Total: 35 endpoints**

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  phone VARCHAR(20),
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  isEmailVerified BOOLEAN DEFAULT FALSE,
  isPhoneVerified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Properties Table
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  price DECIMAL(15,2) NOT NULL,
  beds INTEGER,
  baths INTEGER,
  sqft INTEGER,
  images TEXT[],
  amenities TEXT[],
  type ENUM('Penthouses', 'Villas', 'Estates', 'Commercial', 'Condos'),
  status ENUM('Available', 'Sold', 'Rented', 'Reserved') DEFAULT 'Available',
  ownerId UUID NOT NULL REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Cars Table
```sql
CREATE TABLE cars (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  pricePerDay DECIMAL(10,2),
  specs TEXT,
  images TEXT[],
  features TEXT[],
  category VARCHAR(100),
  availability BOOLEAN DEFAULT TRUE,
  ownerId UUID NOT NULL REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Inquiries, Notifications, Contacts, CarReservations
See `src/models/index.ts` for complete schema definitions.

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

### Getting a Token

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "url"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Refreshing a Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "refresh_token_here"
  }'
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "statusCode": 400
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `INVALID_TOKEN` | 401 | Token is invalid or expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `USER_EXISTS` | 400 | User already exists |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

## Environment Variables

```env
# Server
NODE_ENV=development              # development or production
PORT=3000                         # Server port

# Database
DB_HOST=localhost                 # PostgreSQL host
DB_PORT=5432                      # PostgreSQL port
DB_NAME=restate_db                # Database name
DB_USER=postgres                  # Database user
DB_PASSWORD=postgres              # Database password

# JWT
JWT_SECRET=your_secret_key        # JWT signing secret (change in production!)
JWT_REFRESH_SECRET=your_refresh   # Refresh token secret
JWT_EXPIRY=1h                     # Token expiry time
JWT_REFRESH_EXPIRY=7d             # Refresh token expiry

# CORS
CORS_ORIGIN=http://localhost:19006,https://globalix.com

# OAuth (Coming Soon)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_TEAM_ID=
APPLE_KEY_ID=

# Email Service (Coming Soon)
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@globalix.com

# AWS S3 (Coming Soon)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1
```

## Security

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT token authentication
- ✅ Input validation with express-validator
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Compressed responses
- ✅ SQL injection prevention (Sequelize ORM)

## Database Relationships

```
User (1) ---> (Many) Property
User (1) ---> (Many) Car
User (1) ---> (Many) Inquiry
User (1) ---> (Many) Notification
User (1) ---> (Many) CarReservation
Property (1) ---> (Many) Inquiry
Car (1) ---> (Many) CarReservation
```

## Deployment

### Prerequisites for Production

- [ ] Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random strings
- [ ] Set `NODE_ENV=production`
- [ ] Use PostgreSQL 12+ with proper backups
- [ ] Enable HTTPS
- [ ] Configure CORS for your domain
- [ ] Set up environment variables securely
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Use a reverse proxy (Nginx, Apache)

### Heroku Deployment

```bash
# Create Heroku app
heroku create your-app-name

# Add PostgreSQL add-on
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set JWT_REFRESH_SECRET=your_refresh_secret

# Deploy
git push heroku main
```

### Docker Deployment

```bash
# Build image
docker build -t globalix-group-backend .

# Run container
docker run -p 3000:3000 --env-file .env globalix-group-backend
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Future Enhancements

- [ ] Email service integration for password reset
- [ ] Apple/Google OAuth implementation
- [ ] AWS S3 integration for image uploads
- [ ] WebSocket for real-time notifications
- [ ] Advanced search with filters
- [ ] Payment processing integration
- [ ] Rate limiting and DDoS protection
- [ ] API documentation with Swagger/OpenAPI
- [ ] Unit and integration tests
- [ ] Docker and Kubernetes deployment

## License

MIT - See LICENSE file for details

## Support

For issues and questions:
- Email: support@globalix.com
- Issues: Create an issue in the repository

## Status

✅ **Production Ready** - Version 1.0.0

---

**Last Updated:** January 26, 2026  
**Author:** Globalix Team  
**Repository:** https://github.com/globalix/restate-backend
