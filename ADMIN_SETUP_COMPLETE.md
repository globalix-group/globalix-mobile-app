# ADMIN DASHBOARD SETUP GUIDE

## Overview
The admin dashboard is now properly configured to:
- **Connect only to the admin-backend** (formerly globalix-backend)
- **Require admin authentication** - Only you can access it with admin credentials
- **Monitor app activity** - See who enters the app and their movements
- **Track earnings & analytics** - View platform metrics and user engagement

---

## Environment Variables

### Admin-Backend (.env)
Create a `.env` file in `/apps/services/admin-backend/`:

```env
# Server
PORT=3000
NODE_ENV=development

# Admin Credentials
ADMIN_EMAIL=admin@globalix.com
ADMIN_PASSWORD_HASH=<bcrypt-hashed-password>

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=globalix_admin

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
```

### Admin Dashboard Web App (.env.local)
The file already has the correct configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Generate Admin Password Hash

To generate a bcrypt hash for your admin password:

```bash
cd /apps/services/admin-backend
npm install bcryptjs  # if not already installed

# Run this in Node.js:
const bcrypt = require('bcryptjs');
const password = 'your-secure-password';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Use the output as your `ADMIN_PASSWORD_HASH`.

---

## API Structure

### Admin-specific API Endpoints
All prefixed with `/api/v1/admin/api/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login` | POST | Admin login (public) |
| `/dashboard` | GET | Dashboard stats |
| `/activity` | GET | App activity logs |
| `/earnings` | GET | Platform earnings |
| `/analytics` | GET | Analytics & metrics |
| `/users` | GET | All users list |
| `/auth-stats` | GET | Authentication events |

### User-facing API Endpoints (unchanged)
All prefixed with `/api/v1/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/register` | POST | User registration |
| `/properties` | GET | List properties |
| `/cars` | GET | List cars |
| ... | ... | Other user endpoints |

---

## Running the Services

### 1. Start Admin Backend
```bash
cd /apps/services/admin-backend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 2. Start Admin Dashboard
```bash
cd /apps/web/admin-dashboard
npm install
npm run dev
# Runs on http://localhost:3001
```

### 3. Access Admin Dashboard
- URL: `http://localhost:3001`
- Login with admin credentials
- Only you (admin) can access this

---

## Security Notes

1. **Admin Credentials**: Change `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` to your own
2. **JWT Secret**: Use a strong, random secret in production
3. **CORS**: Limit CORS origins to trusted domains
4. **Token Expiry**: Admin tokens expire after 7 days
5. **Protected Routes**: All admin routes except `/login` require valid admin token

---

## Architecture

```
globalix-group-app (Mobile)
    ↓
globalix-group-backend (User API)
    ↓
User Data & Activities

admin-dashboard (Web)
    ↓
admin-backend (Admin API)
    ↓
Monitors: Activities, Users, Earnings, Analytics
Only accessible with admin credentials
```

---

## Next Steps

1. Set environment variables in both `.env` files
2. Ensure both databases are set up
3. Run `npm install` in both backend directories
4. Start services in this order:
   - Admin Backend (port 3000)
   - Admin Dashboard (port 3001)
5. Login with admin credentials and start monitoring!
