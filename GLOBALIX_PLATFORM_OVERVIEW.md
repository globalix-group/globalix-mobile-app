# Globalix Platform - Complete System Overview

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Purpose:** Comprehensive technical documentation for cybersecurity assessment and system understanding

---

## 🏢 Executive Summary

**Globalix** is a full-stack real estate and luxury car rental platform consisting of:
- **Mobile Application** (React Native/Expo)
- **Admin Dashboard** (Next.js/React)
- **Backend API Services** (Node.js/Express/PostgreSQL)

The platform enables users to browse properties (Penthouses, Villas, Estates, Commercial, Condos) and luxury cars, submit inquiries, manage profiles, and interact with real-time notifications. Administrators can monitor user activities, manage listings, track earnings, and view comprehensive analytics.

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
├──────────────────────────┬──────────────────────────────────┤
│  Mobile App (Expo)       │  Admin Dashboard (Next.js)       │
│  - iOS/Android           │  - Web Interface                 │
│  - Port: 8081            │  - Port: 3001                    │
│  - User-facing           │  - Admin-only                    │
└──────────────┬───────────┴────────────┬─────────────────────┘
               │                        │
               ├────────────────────────┤
               │   Network Layer        │
               │   (HTTP/REST/JSON)     │
               └────────────┬───────────┘
                            │
        ┌───────────────────┴────────────────────┐
        │                                         │
┌───────▼──────────┐                  ┌──────────▼────────┐
│  Backend API     │                  │  Admin Backend    │
│  (Express.js)    │                  │  (Express.js)     │
│  Port: 3002      │                  │  Port: 3000       │
│  - Main API      │                  │  - Admin Auth     │
│  - Activities    │                  │  - Admin API      │
└────────┬─────────┘                  └──────────┬────────┘
         │                                       │
         └───────────────┬───────────────────────┘
                         │
                ┌────────▼─────────┐
                │   PostgreSQL     │
                │   Database       │
                │   restate_db     │
                │   Port: 5432     │
                └──────────────────┘
```

### Network Configuration

- **Machine IP:** 192.168.2.173
- **Backend Binding:** 0.0.0.0 (all network interfaces)
- **Mobile API Endpoint:** `http://192.168.2.173:3002/api/v1`
- **Admin Dashboard Endpoint:** `http://localhost:3001`
- **Backend Health Check:** `http://localhost:3002/health`

---

## 📱 Mobile Application (globalix-group-app)

### Technology Stack
- **Framework:** React Native with Expo SDK 52
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **State Management:** React Context API
- **HTTP Client:** Native Fetch API
- **Development Server:** Metro Bundler (Port 8081)

### Key Features

1. **Authentication System**
   - Email/Password Login
   - User Registration (Sign Up)
   - Profile Management
   - Password Reset (planned)

2. **Property Browsing**
   - Filter by Type: Penthouses, Villas, Estates, Commercial, Condos
   - View Details: Images, Location, Price, Specs
   - Map Integration (GPS coordinates)
   - Submit Inquiries

3. **Car Rental**
   - Browse Luxury Cars
   - View Specifications
   - Price per Day/Total
   - Car Reservations
   - Availability Tracking

4. **User Features**
   - Profile Management
   - Notification Center
   - Activity Tracking
   - Help Center
   - Contact Support

### Mobile App File Structure

```
globalix-group-app/
├── App.tsx                    # Main entry point
├── app.json                   # Expo configuration
├── src/
│   ├── components/
│   │   └── GlobalixHeader.tsx # Reusable header component
│   ├── screens/
│   │   ├── authentication/    # Login/Signup screens
│   │   ├── HomeScreen.tsx
│   │   ├── ExploreScreen.tsx
│   │   ├── CarsScreen.tsx
│   │   ├── DetailsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   ├── InquireScreen.tsx
│   │   └── ...
│   ├── services/
│   │   └── apiClient.ts      # HTTP client for backend
│   └── theme/
│       ├── ThemeContext.tsx  # Dark/Light mode
│       └── index.ts
└── assets/
    └── logos/
```

### API Integration

**Base URL:** `http://192.168.2.173:3002/api/v1`

**Activity Logging:**
- All user actions are logged to backend
- Types: login, signup, property_view, car_view, inquiry
- Real-time tracking for admin dashboard

---

## 🖥️ Admin Dashboard

### Technology Stack
- **Framework:** Next.js 14.2.35 (React)
- **Language:** TypeScript
- **Styling:** TailwindCSS 3.4.15
- **HTTP Client:** Axios
- **Port:** 3001

### Dashboard Features

#### 1. Analytics Dashboard (`/`)
- **Real-time Statistics:**
  - Total Users
  - Active Users
  - Total Earnings
  - Pending Inquiries
  - New Signups Today
  - Total Logins

- **Quick Stats Panel:**
  - Daily Conversion Rates
  - Login Trends
  - User Growth

#### 2. Activity Monitoring (`/activity`)
- **Real-time Activity Feed:**
  - Auto-refresh every 3 seconds
  - User login/signup events
  - Property and car viewing
  - Inquiry submissions
  - Timestamped entries

- **Filtering Options:**
  - Filter by Type (login, signup, all)
  - Pagination (20 items per page)
  - Search functionality

#### 3. User Management
- View all registered users
- User details and activity history
- Account status management

#### 4. Content Management
- Manage property listings
- Manage car inventory
- Pricing updates

#### 5. Inquiry Management
- View pending inquiries
- Contact customers
- Status tracking (Pending, Contacted, Viewed, Closed)

### Admin Dashboard Structure

```
admin-dashboard/
├── src/
│   ├── pages/
│   │   ├── index.tsx          # Main dashboard
│   │   ├── activity.tsx       # Activity monitoring
│   │   ├── users.tsx          # User management
│   │   └── ...
│   ├── components/
│   │   ├── Sidebar.tsx        # Navigation
│   │   ├── StatCard.tsx       # Metric cards
│   │   └── ActivityTable.tsx  # Activity list
│   ├── api/
│   │   └── adminClient.ts     # API client
│   ├── context/
│   │   └── AuthContext.tsx    # Admin authentication
│   └── styles/
│       └── globals.css
├── public/
│   └── logos/
└── next.config.js
```

### Authentication

**Admin Credentials:**
- Email: `admin@globalix.com`
- Password: `admin123`
- JWT-based authentication
- Session management via HTTP-only cookies

---

## 🔧 Backend Services

### 1. Globalix Backend (Port 3002)

**Purpose:** Main API server for mobile app and admin dashboard

**Technology Stack:**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database ORM:** Sequelize
- **Database:** PostgreSQL 12+
- **Authentication:** JWT (JSON Web Tokens)
- **TypeScript:** Strict mode enabled
- **Hot Reload:** ts-node-dev

**API Endpoints:**

```
/api/v1/
├── /auth
│   ├── POST /register          # User registration
│   ├── POST /login             # User login
│   ├── POST /refresh           # Refresh access token
│   └── POST /logout            # User logout
│
├── /users
│   ├── GET /me                 # Get current user profile
│   ├── PUT /me                 # Update user profile
│   └── GET /:id                # Get user by ID
│
├── /properties
│   ├── GET /                   # List all properties
│   ├── GET /:id                # Get property details
│   ├── POST /                  # Create property (admin)
│   ├── PUT /:id                # Update property (admin)
│   └── DELETE /:id             # Delete property (admin)
│
├── /cars
│   ├── GET /                   # List all cars
│   ├── GET /:id                # Get car details
│   ├── POST /                  # Create car listing (admin)
│   └── PUT /:id                # Update car (admin)
│
├── /inquiries
│   ├── GET /                   # List inquiries
│   ├── POST /                  # Submit inquiry
│   ├── GET /:id                # Get inquiry details
│   └── PUT /:id                # Update inquiry status
│
├── /notifications
│   ├── GET /                   # Get user notifications
│   ├── PUT /:id/read           # Mark notification as read
│   └── POST /                  # Create notification (admin)
│
├── /contacts
│   ├── POST /                  # Submit contact form
│   └── GET /                   # List contacts (admin)
│
├── /activities
│   ├── POST /log               # Log user activity
│   └── GET /                   # Get activity logs (admin)
│
├── /reservations
│   ├── POST /                  # Create car reservation
│   ├── GET /user/:userId       # Get user reservations
│   └── PUT /:id                # Update reservation status
│
└── /health                     # Health check endpoint
```

**Database Models:**

1. **Users**
   - id (UUID)
   - email (unique)
   - password (bcrypt hashed)
   - name
   - avatar
   - phone
   - bio
   - preferences (JSONB)
   - isEmailVerified
   - isPhoneVerified
   - timestamps

2. **Properties**
   - id (UUID)
   - title
   - description
   - location
   - latitude/longitude
   - price (DECIMAL)
   - beds, baths, sqft
   - images (Array)
   - amenities (Array)
   - type (ENUM: Penthouses, Villas, Estates, Commercial, Condos)
   - status (ENUM: Available, Sold, Rented, Reserved)
   - ownerId (FK to Users)

3. **Cars**
   - id (UUID)
   - name, brand, model
   - year
   - price (total)
   - pricePerDay
   - specs
   - images (Array)
   - features (Array)
   - category
   - availability (boolean)
   - ownerId (FK to Users)

4. **Inquiries**
   - id (UUID)
   - userId (FK to Users)
   - propertyId (FK to Properties)
   - message
   - status (ENUM: Pending, Contacted, Viewed, Closed)
   - timestamps

5. **Notifications**
   - id (UUID)
   - userId (FK to Users)
   - type
   - title
   - message
   - isRead
   - data (JSONB)
   - timestamps

6. **Contacts**
   - id (UUID)
   - name, email, phone
   - message
   - isResolved
   - timestamps

7. **Car Reservations**
   - id (UUID)
   - userId (FK to Users)
   - carId (FK to Cars)
   - startDate, endDate
   - totalPrice
   - status (ENUM: Pending, Confirmed, Cancelled, Completed)
   - timestamps

**Security Features:**
- Password hashing with bcrypt (10 rounds)
- JWT authentication with refresh tokens
- CORS enabled
- Input validation
- SQL injection protection (Sequelize ORM)
- XSS protection
- Rate limiting (planned)

### 2. Admin Backend (Port 3000)

**Purpose:** Dedicated backend for admin authentication and operations

**Features:**
- Admin user authentication
- Admin-specific JWT tokens
- Separate database tables
- Admin activity logging

---

## 🔐 Security Architecture (For Cybersecurity Assessment)

### Authentication & Authorization

1. **JWT Token System**
   - Access Token: Short-lived (1 hour)
   - Refresh Token: Long-lived (7 days)
   - Stored in HTTP-only cookies (admin) / Local storage (mobile)

2. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Minimum length requirements
   - No plaintext storage

3. **API Security**
   - Bearer token authentication
   - Protected routes require valid JWT
   - Role-based access control (user vs admin)

### Data Security

1. **Database**
   - PostgreSQL with SSL (configurable)
   - Connection pooling
   - Prepared statements (Sequelize prevents SQL injection)
   - JSONB for flexible data without NoSQL vulnerabilities

2. **Network Security**
   - CORS configuration
   - Rate limiting headers
   - HTTP-only cookies for admin sessions
   - HTTPS ready (production)

3. **Data Validation**
   - Email validation
   - Phone number validation
   - File upload restrictions
   - Request size limits

### Potential Security Concerns (For Assessment)

⚠️ **Areas to Review:**

1. **Network Exposure**
   - Backend listening on 0.0.0.0 (all interfaces)
   - No firewall rules mentioned
   - Direct IP access: http://192.168.2.173:3002

2. **Authentication**
   - JWT secrets in .env files (ensure strong secrets)
   - Token refresh mechanism needs validation
   - Session management for admin dashboard

3. **Input Validation**
   - Check for XSS vulnerabilities in user-generated content
   - File upload validation (images for properties/cars)
   - SQL injection tests (should be protected by Sequelize)

4. **API Endpoints**
   - No rate limiting currently implemented
   - CORS policy needs review
   - Admin endpoints need additional authorization checks

5. **Mobile App**
   - API endpoints hardcoded (need environment variables)
   - Local storage of sensitive data
   - Network traffic encryption

6. **Admin Dashboard**
   - Default admin credentials need rotation
   - Session timeout policies
   - Admin activity logging

7. **Database**
   - Connection string security
   - Database backup strategy
   - Sensitive data encryption at rest

8. **Dependencies**
   - NPM package vulnerabilities
   - Outdated dependencies check needed
   - Supply chain security

---

## 🔍 Activity Logging System

### Architecture

**Flow:** Mobile App → Backend API → In-Memory Storage → Admin Dashboard

**Implementation:**
- **Logger:** ActivityLogger service (in-memory array, max 1000 logs)
- **Endpoint:** POST `/api/v1/activities/log`
- **Retrieval:** GET `/api/v1/activities` (admin only)
- **Frequency:** Real-time logging, 3-second polling from dashboard

**Logged Activities:**
- User login/logout
- User registration
- Property views
- Car views
- Inquiry submissions
- Profile updates

**Data Structure:**
```typescript
{
  userId: string,
  action: string,
  type: 'login' | 'signup' | 'property_view' | 'car_view' | 'inquiry',
  metadata: Record<string, any>,
  timestamp: Date
}
```

---

## 🗄️ Database Schema

**Database Name:** restate_db  
**Type:** PostgreSQL 12+  
**Connection:** Sequelize ORM

**Tables:**
1. users
2. properties
3. cars
4. inquiries
5. notifications
6. contacts
7. car_reservations

**Relationships:**
- User → Properties (one-to-many)
- User → Cars (one-to-many)
- User → Inquiries (one-to-many)
- Property → Inquiries (one-to-many)
- User → Notifications (one-to-many)
- User → Car Reservations (one-to-many)
- Car → Car Reservations (one-to-many)

---

## 🚀 Deployment & Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=3002
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=restate_db
DB_PORT=5432
JWT_SECRET=your_random_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=development
```

**Admin Backend (.env):**
```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=restate_db
JWT_SECRET=admin_jwt_secret
```

**Mobile App:**
- API_BASE_URL: `http://192.168.2.173:3002/api/v1`
- Configured in `src/services/apiClient.ts`

### Running the Platform

**Backend:**
```bash
cd apps/services/globalix-group-backend
PORT=3002 npm run dev
```

**Admin Backend:**
```bash
cd apps/services/admin-backend
npm run dev
```

**Admin Dashboard:**
```bash
cd apps/web/admin-dashboard
npm run dev
```

**Mobile App:**
```bash
cd apps/mobile/globalix-group-app
npm start
# Then press 'i' for iOS simulator or 'a' for Android
```

### Production Considerations

1. **Environment**
   - Use production database with SSL
   - Enable HTTPS with valid certificates
   - Set NODE_ENV=production
   - Use proper secret management (AWS Secrets Manager, Vault)

2. **Performance**
   - Enable database connection pooling
   - Implement Redis caching
   - Use CDN for static assets
   - Optimize images

3. **Monitoring**
   - Application logging (Winston, Morgan)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)
   - Uptime monitoring

4. **Backup**
   - Automated database backups
   - Code repository backups
   - Configuration backups

---

## 📊 Technology Stack Summary

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Mobile App | React Native | 0.76 | Cross-platform mobile |
| Mobile Framework | Expo | SDK 52 | Development framework |
| Mobile Bundler | Metro | Latest | JavaScript bundler |
| Admin Dashboard | Next.js | 14.2.35 | Server-side React |
| Backend API | Express.js | 4.x | REST API server |
| Language | TypeScript | 5.x | Type safety |
| Database | PostgreSQL | 12+ | Relational data |
| ORM | Sequelize | 6.x | Database abstraction |
| Authentication | JWT | Latest | Token-based auth |
| Password Hashing | Bcrypt | Latest | Password security |
| HTTP Client | Axios/Fetch | Latest | API requests |
| Styling | TailwindCSS | 3.4.15 | Utility-first CSS |
| Runtime | Node.js | 18+ | JavaScript runtime |

---

## 📞 API Usage Examples

### User Registration
```bash
POST http://192.168.2.173:3002/api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

### User Login
```bash
POST http://192.168.2.173:3002/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Log Activity
```bash
POST http://192.168.2.173:3002/api/v1/activities/log
Content-Type: application/json

{
  "userId": "user-123",
  "action": "User viewed property",
  "type": "property_view",
  "metadata": {
    "propertyId": "prop-456",
    "propertyTitle": "Luxury Villa"
  }
}
```

### Get Properties
```bash
GET http://192.168.2.173:3002/api/v1/properties
Authorization: Bearer <jwt_token>
```

---

## 🧪 Testing & Quality Assurance

### Recommended Security Tests

1. **Authentication Testing**
   - Brute force attack simulation
   - Token expiration validation
   - Session hijacking attempts
   - Password reset flow security

2. **Authorization Testing**
   - Privilege escalation attempts
   - Admin endpoint access without proper role
   - Resource access control

3. **Input Validation**
   - SQL injection tests
   - XSS payload injection
   - Path traversal attempts
   - File upload exploits

4. **Network Security**
   - Man-in-the-middle attack simulation
   - CORS policy validation
   - SSL/TLS configuration review

5. **API Security**
   - Rate limiting tests
   - DDoS resilience
   - Large payload handling
   - Malformed request handling

---

## 📚 Documentation References

- Backend API: `/apps/services/globalix-group-backend/README.md`
- Admin Dashboard: `/apps/web/admin-dashboard/README.md`
- Mobile App: `/apps/mobile/globalix-group-app/README.md` (if exists)
- Database Models: `/apps/services/globalix-group-backend/src/models/index.ts`

---

## 🎯 Cybersecurity Assessment Checklist

### Critical Areas for Review

- [ ] **Authentication System**
  - [ ] JWT implementation review
  - [ ] Password policy enforcement
  - [ ] Session management
  - [ ] Multi-factor authentication (not implemented)

- [ ] **Authorization**
  - [ ] Role-based access control
  - [ ] API endpoint protection
  - [ ] Admin privilege verification

- [ ] **Data Protection**
  - [ ] Encryption at rest
  - [ ] Encryption in transit
  - [ ] Sensitive data handling
  - [ ] PII protection compliance

- [ ] **Network Security**
  - [ ] Firewall configuration
  - [ ] Port exposure review
  - [ ] CORS policy
  - [ ] DDoS protection

- [ ] **Application Security**
  - [ ] Input validation
  - [ ] Output encoding
  - [ ] SQL injection prevention
  - [ ] XSS prevention
  - [ ] CSRF protection

- [ ] **Infrastructure**
  - [ ] Server hardening
  - [ ] Database security
  - [ ] Dependency vulnerabilities
  - [ ] Logging and monitoring

- [ ] **Mobile Security**
  - [ ] API key storage
  - [ ] Local data encryption
  - [ ] Certificate pinning
  - [ ] Reverse engineering protection

- [ ] **Compliance**
  - [ ] GDPR requirements
  - [ ] Data retention policies
  - [ ] Privacy policy implementation
  - [ ] Terms of service

---

## 📝 Notes for Security Auditors

1. **Current State:** Development environment with hardcoded credentials and no production security measures
2. **Network Binding:** Backend intentionally listens on 0.0.0.0 for mobile app connectivity
3. **Activity Logging:** In-memory storage (not persistent) - consider database persistence
4. **Admin Access:** Default credentials should be changed immediately
5. **HTTPS:** Not currently implemented - required for production
6. **Rate Limiting:** Not implemented - vulnerable to brute force and DoS
7. **File Uploads:** Property/car images need upload validation and virus scanning
8. **API Documentation:** Consider adding Swagger/OpenAPI documentation

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 27, 2026 | Initial comprehensive documentation |

---

**End of Document**
