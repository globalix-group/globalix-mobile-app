# Globalix Group - Real Estate & Luxury Car Rental Platform

> Complete full-stack platform for luxury real estate and car rental services

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB.svg)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-green.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791.svg)](https://www.postgresql.org/)

## 📋 Overview

Globalix is a modern, full-stack platform that connects luxury property seekers and car rental customers with premium listings. The platform includes a mobile application for end-users and a comprehensive admin dashboard for business management.

## 🏗️ Project Structure

```
globalix-group/
├── apps/
│   ├── mobile/
│   │   └── globalix-group-app/      # React Native Mobile App (Expo)
│   ├── web/
│   │   └── admin-dashboard/         # Next.js Admin Dashboard
│   └── services/
│       ├── globalix-group-backend/  # Main API Backend (Port 3002)
│       └── admin-backend/           # Admin Authentication Service (Port 3000)
├── GLOBALIX_PLATFORM_OVERVIEW.md   # Complete technical documentation
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-ORG/globalix-group.git
   cd globalix-group
   ```

2. **Install dependencies for all services**
   ```bash
   # Backend API
   cd apps/services/globalix-group-backend
   npm install
   
   # Admin Backend
   cd ../admin-backend
   npm install
   
   # Admin Dashboard
   cd ../../web/admin-dashboard
   npm install
   
   # Mobile App
   cd ../../mobile/globalix-group-app
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in each service directory:

   **Backend (`apps/services/globalix-group-backend/.env`):**
   ```env
   PORT=3002
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=restate_db
   DB_PORT=5432
   JWT_SECRET=
   JWT_REFRESH_SECRET=your_refresh_secret_here
   NODE_ENV=development
   ```

   **Admin Backend (`apps/services/admin-backend/.env`):**
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=restate_db
   JWT_SECRET=
   ```

4. **Create database**
   ```bash
   createdb restate_db
   ```

5. **Start all services**

   **Terminal 1 - Backend API:**
   ```bash
   cd apps/services/globalix-group-backend
   PORT=3002 npm run dev
   ```

   **Terminal 2 - Admin Backend:**
   ```bash
   cd apps/services/admin-backend
   npm run dev
   ```

   **Terminal 3 - Admin Dashboard:**
   ```bash
   cd apps/web/admin-dashboard
   npm run dev
   ```

   **Terminal 4 - Mobile App:**
   ```bash
   cd apps/mobile/globalix-group-app
   npm start
   ```

6. **Access the applications**
   - **Mobile App:** Scan QR code with Expo Go app or press `i` for iOS simulator
   - **Admin Dashboard:** http://localhost:3001
   - **Backend API:** http://localhost:3002/api/v1
   - **Admin Backend:** http://localhost:3000

## 📱 Mobile Application

Premium mobile experience built with React Native and Expo.

### Features
- 🏠 **Property Browsing** - Penthouses, Villas, Estates, Commercial, Condos
- 🚗 **Luxury Car Rentals** - Browse and reserve premium vehicles
- 👤 **User Profiles** - Personalized accounts with preferences
- 🔔 **Real-time Notifications** - Stay updated on inquiries and bookings
- 📍 **Location Services** - Map integration for property locations
- 💬 **Inquiry System** - Direct communication with property owners

### Technology Stack
- React Native 0.76
- Expo SDK 52
- TypeScript
- React Navigation
- Native Fetch API

## 🖥️ Admin Dashboard

Comprehensive control center for platform management.

### Features
- 📊 **Analytics Dashboard** - Real-time statistics and insights
- 📝 **Activity Monitoring** - Track user actions and engagement
- 👥 **User Management** - View and manage registered users
- 🏘️ **Property Management** - Add, edit, and manage listings
- 🚘 **Car Inventory** - Manage luxury car fleet
- 💰 **Earnings Tracking** - Monitor revenue and transactions
- 📮 **Inquiry Management** - Handle customer inquiries

### Technology Stack
- Next.js 14.2.35
- React
- TypeScript
- TailwindCSS 3.4
- Axios

### Admin Credentials
- **Email:** admin@globalix.com
- **Password:** admin123

## 🔧 Backend Services

### Main API Backend (Port 3002)

RESTful API serving mobile app and admin dashboard.

**Key Endpoints:**
- `/api/v1/auth/*` - Authentication (register, login, refresh, logout)
- `/api/v1/users/*` - User management
- `/api/v1/properties/*` - Property CRUD operations
- `/api/v1/cars/*` - Car inventory management
- `/api/v1/inquiries/*` - Customer inquiries
- `/api/v1/notifications/*` - Push notifications
- `/api/v1/activities/*` - Activity tracking
- `/api/v1/reservations/*` - Car reservations

**Technology Stack:**
- Node.js 18+
- Express.js 4.x
- PostgreSQL 12+
- Sequelize ORM
- JWT Authentication
- Bcrypt for password hashing
- TypeScript

### Admin Backend (Port 3000)

Dedicated service for admin authentication and operations.

## 🗄️ Database Schema

PostgreSQL database with the following models:

- **Users** - Customer accounts
- **Properties** - Real estate listings
- **Cars** - Luxury vehicle inventory
- **Inquiries** - Customer inquiries with status tracking
- **Notifications** - User notifications
- **Contacts** - Contact form submissions
- **Car Reservations** - Rental bookings

## 📚 Documentation

For detailed technical documentation, security guidelines, and API reference, see:

- **[Complete Platform Overview](./GLOBALIX_PLATFORM_OVERVIEW.md)** - Comprehensive technical documentation
- **[Admin Dashboard Guide](./apps/web/admin-dashboard/README.md)** - Dashboard features and usage
- **[Backend API Documentation](./apps/services/globalix-group-backend/README.md)** - API endpoints and usage

## 🔐 Security

### Authentication
- JWT-based authentication with refresh tokens
- Bcrypt password hashing (10 rounds)
- HTTP-only cookies for admin sessions

### API Security
- CORS enabled
- Input validation
- SQL injection protection (Sequelize ORM)
- XSS protection

### Recommended for Production
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Implement rate limiting
- [ ] Add DDoS protection
- [ ] Configure firewall rules
- [ ] Use environment-based secrets management
- [ ] Enable database encryption at rest
- [ ] Implement comprehensive logging

## 🚀 Deployment

### Production Checklist

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use production database with SSL
   - Configure proper CORS origins
   - Set strong JWT secrets

2. **Database**
   - Enable SSL connections
   - Set up automated backups
   - Configure connection pooling

3. **Monitoring**
   - Application logging (Winston, Morgan)
   - Error tracking (Sentry)
   - Performance monitoring
   - Uptime monitoring

4. **CDN & Assets**
   - Use CDN for static assets
   - Optimize and compress images
   - Enable caching headers

## 🛠️ Development

### Code Standards
- TypeScript strict mode
- ESLint for code quality
- Prettier for formatting
- Consistent naming conventions

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature

# Create pull request
```

### Testing
```bash
# Backend tests
cd apps/services/globalix-group-backend
npm test

# Frontend tests
cd apps/web/admin-dashboard
npm test
```

## 📦 Technology Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Mobile App | React Native | 0.76 |
| Mobile Framework | Expo | SDK 52 |
| Admin Dashboard | Next.js | 14.2.35 |
| Backend | Express.js | 4.x |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 12+ |
| ORM | Sequelize | 6.x |
| Authentication | JWT | Latest |
| Styling | TailwindCSS | 3.4.15 |
| Runtime | Node.js | 18+ |

## 🔒 Security

This project implements comprehensive security measures:

- **Static Analysis**: CodeQL scans all code for vulnerabilities
- **Secret Detection**: Gitleaks prevents credentials from being committed
- **Dependency Scanning**: npm audit checks for known vulnerabilities
- **Container Security**: Trivy scans Docker images before deployment
- **Input Validation**: All API endpoints validate and sanitize input
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse
- **Authentication**: JWT-based with secure token storage and rotation
- **Encryption**: Passwords hashed with bcryptjs, all sensitive data encrypted
- **Headers**: Security headers enforced via Helmet
- **CORS**: Restricted to known origins, no wildcard policies

**Automated Security Checks**: All pull requests must pass:
- ✅ CodeQL analysis
- ✅ Gitleaks secret detection
- ✅ npm audit (moderate severity+)
- ✅ Trivy container scanning
- ✅ TypeScript type checking

For security concerns, see [SECURITY.md](./SECURITY.md) for reporting procedures and security policy.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**All pull requests must pass security checks** before merging.

## 📄 License

This project is proprietary software owned by Globalix Group of Companies.

## 👥 Team

**Globalix Group of Companies**
- Platform Development
- Business Operations
- Customer Support

## 📞 Contact

For business inquiries and support:
- **Website:** [Coming Soon]
- **Email:** admin@globalix.com
- **Support:** Available through mobile app

## 🗺️ Roadmap

### Current Version (1.0)
- ✅ Mobile app with property and car browsing
- ✅ Admin dashboard with analytics
- ✅ User authentication and profiles
- ✅ Real-time activity tracking
- ✅ Inquiry management

### Upcoming Features
- 🔄 Payment integration (Stripe/PayPal)
- 🔄 Advanced search and filters
- 🔄 Push notifications (Firebase)
- 🔄 In-app messaging
- 🔄 Property tours scheduling
- 🔄 Multi-language support
- 🔄 Mobile app for iOS and Android stores
- 🔄 AI-powered recommendations

---

**Built with ❤️ by Globalix Group of Companies**
