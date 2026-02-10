# 🚀 Server Startup Complete - Quick Access Guide

**Date**: January 30, 2026  
**Status**: ✅ All Servers Running

## 🎯 Access URLs

### Admin Dashboard
- **URL**: http://localhost:3001
- **Status**: ✅ Running (Next.js)
- **Features**: Activity logs, analytics, user management

### API Endpoints

**Main Backend API**
- **Base URL**: http://localhost:3002/api/v1
- **Health Check**: http://localhost:3002/health
- **Port**: 3002
- **Status**: ✅ Running (Express.js)

**Admin Backend API**
- **Base URL**: http://localhost:3000/api/v1
- **Health Check**: http://localhost:3000/health
- **Port**: 3000
- **Status**: ✅ Running (Express.js)

## 🔐 Test Credentials

```
Email:    demo@globalix.com
Password: Password123!
```

## 📊 Available Endpoints (Main API)

### Authentication
```
POST   /api/v1/auth/register        - Register new user
POST   /api/v1/auth/login           - Login user
POST   /api/v1/auth/refresh-token   - Refresh JWT token
POST   /api/v1/auth/forgot-password - Request password reset
```

### Properties
```
GET    /api/v1/properties           - Get all properties
GET    /api/v1/properties/:id       - Get property details
POST   /api/v1/properties           - Create property (admin)
PUT    /api/v1/properties/:id       - Update property (admin)
DELETE /api/v1/properties/:id       - Delete property (admin)
```

### Cars
```
GET    /api/v1/cars                 - Get all cars
GET    /api/v1/cars/:id             - Get car details
POST   /api/v1/cars                 - Create car (admin)
PUT    /api/v1/cars/:id             - Update car (admin)
DELETE /api/v1/cars/:id             - Delete car (admin)
```

### Inquiries
```
POST   /api/v1/inquiries            - Create inquiry
GET    /api/v1/inquiries            - Get all inquiries (admin)
PUT    /api/v1/inquiries/:id        - Update inquiry status (admin)
```

### Contacts
```
POST   /api/v1/contacts             - Submit contact form
GET    /api/v1/contacts             - Get all contacts (admin)
PUT    /api/v1/contacts/:id         - Update contact (admin)
```

### Activity Logs
```
POST   /api/v1/activities           - Log activity
GET    /api/v1/activities           - Get activity logs (admin)
```

### User Profile
```
GET    /api/v1/users/profile        - Get user profile
PUT    /api/v1/users/profile        - Update user profile
GET    /api/v1/users/:id            - Get user details (admin)
```

## 📱 Mobile App Setup

To start the mobile app:

```bash
cd apps/mobile/globalix-group-app
npx expo start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

Mobile API Configuration (in apiClient.ts):
- iOS: `http://localhost:3002/api/v1`
- Android: `http://10.0.2.2:3002/api/v1`

## 📊 Admin Dashboard Features

### What You Can Do:
- ✅ View activity logs and analytics
- ✅ Manage users and profiles
- ✅ Monitor property and car listings
- ✅ View inquiries and reservations
- ✅ Track user engagement metrics
- ✅ Manage contacts and messages

### Login:
1. Go to http://localhost:3001
2. Use demo credentials:
   - Email: `demo@globalix.com`
   - Password: `Password123!`

## 🛠️ Server Management

### Stop All Servers
```bash
pkill -f "npm run dev"
pkill -f "next dev"
```

### Restart Individual Servers
```bash
# Backend (Port 3002)
lsof -ti:3002 | xargs kill -9
cd apps/services/globalix-group-backend && npm run dev

# Admin Backend (Port 3000)
lsof -ti:3000 | xargs kill -9
cd apps/services/admin-backend && npm run dev

# Admin Dashboard (Port 3001)
lsof -ti:3001 | xargs kill -9
cd apps/web/admin-dashboard && npm run dev
```

### View Live Logs
```bash
# Backend logs
tail -f /tmp/backend.log

# Admin backend logs
tail -f /tmp/admin-backend.log

# Admin dashboard logs
tail -f /tmp/admin-dashboard.log
```

## 📊 Test Data Available

**Demo User Account**
- Email: `demo@globalix.com`
- Password: `Password123!`
- Created by seed script

**Properties (3 total)**
- Skyline Penthouse - $4.5M
- Modern Lake Villa - $2.85M
- Glass House Estate - $6.2M

**Cars (3 total)**
- Lamborghini Urus - $260K
- Rolls-Royce Ghost - $390K
- McLaren 720S - $299K

## 🔐 Security Features

- ✅ JWT-based authentication (access + refresh tokens)
- ✅ Rate limiting (30 req/15min for auth, 300 req/15min general)
- ✅ CORS protection with allowlist (no wildcards)
- ✅ Input validation on all endpoints
- ✅ Password hashing with bcryptjs
- ✅ Security headers via Helmet
- ✅ CI/CD security scanning (CodeQL, Gitleaks, npm audit, Trivy)

## 📚 API Testing

### Using curl
```bash
# Get all properties
curl http://localhost:3002/api/v1/properties

# Get all cars
curl http://localhost:3002/api/v1/cars

# Login
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@globalix.com",
    "password": "Password123!"
  }'

# Get health status
curl http://localhost:3002/health
```

### Using Postman
1. Import the API endpoints
2. Set base URL to `http://localhost:3002/api/v1`
3. Login to get JWT token
4. Add token to Authorization header: `Bearer {token}`

## 🌍 Network Access

### Local Machine (Localhost)
```
Admin Dashboard: http://localhost:3001
Backend API:     http://localhost:3002/api/v1
Admin API:       http://localhost:3000/api/v1
```

### From Other Devices (Local Network)
```
Admin Dashboard: http://192.168.2.173:3001
Backend API:     http://192.168.2.173:3002/api/v1
```

## 🚨 Troubleshooting

### Backend won't start
- Check if port 3002 is in use: `lsof -ti:3002`
- Verify PostgreSQL is running
- Check database connection: `echo $DATABASE_URL`

### Admin Dashboard won't load
- Clear browser cache (Cmd+Shift+R)
- Check console for errors (F12)
- Verify Next.js is running on port 3001

### Mobile app can't connect
- iOS: Ensure `localhost:3002` is accessible
- Android: Use `10.0.2.2:3002` instead of `localhost`
- Check CORS settings if getting CORS errors

### Database errors
- Verify PostgreSQL service is running
- Check database credentials in `.env`
- Run migrations: `npm run db:migrate`

## 📖 Documentation References

- **Platform Overview**: [GLOBALIX_PLATFORM_OVERVIEW.md](GLOBALIX_PLATFORM_OVERVIEW.md)
- **Security**: [SECURITY.md](SECURITY.md)
- **CI/CD Security**: [CI_CD_SECURITY_GUIDE.md](CI_CD_SECURITY_GUIDE.md)
- **README**: [README.md](README.md)

## ✅ Checklist

- [x] All three servers running
- [x] Database connected and synced
- [x] Admin dashboard accessible
- [x] API endpoints responding
- [x] Test data seeded
- [x] Security measures active
- [x] CI/CD workflows configured

---

**All systems are GO!** 🚀

You're ready to:
- Access the admin dashboard at http://localhost:3001
- Test APIs using curl or Postman
- Start the mobile app with `npx expo start`
- View live logs with `tail -f /tmp/backend.log`

---

*Last Updated: January 30, 2026*
