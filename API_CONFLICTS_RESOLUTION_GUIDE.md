# 🔧 API CONFLICTS - RESOLUTION GUIDE
## Step-by-Step Implementation

**Date:** February 9, 2026  
**Priority:** CRITICAL  
**Status:** Implementation Ready

---

## 📋 CONFLICTS SUMMARY

| Conflict | Severity | Impact | Status |
|----------|----------|--------|--------|
| Dual Database Names | 🔴 Critical | Admin can't see user data | Ready to fix |
| Auth Validation Mismatch | 🔴 Critical | Inconsistent login rules | Ready to fix |
| JWT Secret Fallback | 🔴 Critical | Security vulnerability | Ready to fix |
| DB Pool Config Mismatch | 🟠 High | Connection handling inconsistent | Ready to fix |
| Route Nesting Issues | 🟠 High | Endpoint collision risks | Ready to fix |

---

## 🎯 CONFLICT #1: Dual Database Names

### Problem
```
globalix-group-backend → restate_db
admin-backend → globalix_db

Result: TWO SEPARATE DATABASES
- Users created in globalix-group-backend INVISIBLE to admin-backend
- Admin dashboard shows NO user data
- Data inconsistency across system
```

### Current Code
**globalix-group-backend/src/config/database.ts:**
```typescript
const sequelize = new Sequelize(
  'restate_db',  // ← WRONG: Different DB
  'postgres',
  process.env.DB_PASSWORD,
  {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    pool: { max: 5, min: 0 },
  }
);
```

**admin-backend/src/config/database.ts:**
```typescript
const sequelize = new Sequelize(
  'globalix_db',  // ← WRONG: Different DB
  'postgres',
  process.env.DB_PASSWORD,
  {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    pool: { max: 10, min: 2 },
  }
);
```

### Solution
**Replace BOTH files with unified configuration:**

Create `/apps/services/globalix-group-backend/src/config/database.ts`:
```typescript
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'restate_db',  // ✅ UNIFIED
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    acquire: 30000,
    idle: 10000,
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: 'UTC',
  timestamps: true,
});

export default sequelize;
```

Do EXACTLY the same for `/apps/services/admin-backend/src/config/database.ts`

### Verification
```bash
# Both backends should use the same database
cd apps/services/globalix-group-backend && node -e "require('./src/config/database').default.authenticate().then(() => console.log('✅ globalix-group connected to restate_db')"

cd apps/services/admin-backend && node -e "require('./src/config/database').default.authenticate().then(() => console.log('✅ admin connected to restate_db')"
```

**Expected Output:**
```
✅ globalix-group connected to restate_db
✅ admin connected to restate_db
```

---

## 🎯 CONFLICT #2: Authentication Validation Mismatch

### Problem
```
globalix-group-backend: password.isLength({ min: 8 })
admin-backend: password.isLength({ min: 6 })

Result: INCONSISTENT PASSWORD RULES
- User registers with 6-char password on admin
- Tries to login on app (requires 8 chars) → FAILS
- Security standards inconsistent
```

### Current Code
**globalix-group-backend/src/controllers/authController.ts:**
```typescript
validator.isLength({ min: 8 }),  // ← 8 characters required
```

**admin-backend/src/controllers/authController.ts:**
```typescript
validator.isLength({ min: 6 }),  // ← 6 characters required
```

### Solution
**Create unified auth validation:**

Create `/apps/services/shared/auth.ts`:
```typescript
import * as validator from 'express-validator';

// Sophisticated password validation
export const passwordValidator = [
  validator
    .body('password')
    .isLength({ min: 12 })  // ✅ UNIFIED: 12 characters
    .withMessage('Password must be at least 12 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number, and symbol'),
];

// Email validation
export const emailValidator = [
  validator.body('email').isEmail().withMessage('Invalid email address'),
];

// Complete registration validation
export const registerValidator = [...emailValidator, ...passwordValidator];
```

**Update globalix-group-backend/src/controllers/authController.ts:**
```typescript
import { registerValidator } from '../../../shared/auth';

export const register = [
  ...registerValidator,  // ✅ Use unified validation
  async (req: Request, res: Response) => {
    // existing code
  },
];
```

**Update admin-backend/src/controllers/authController.ts:**
```typescript
import { registerValidator } from '../../../shared/auth';

export const register = [
  ...registerValidator,  // ✅ Use unified validation
  async (req: Request, res: Response) => {
    // existing code
  },
];
```

### Verification
```bash
# Test with weak password (should fail)
curl -X POST http://localhost:3002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak"}'
# Expected: 400 Bad Request - Password must be at least 12 characters

# Test with strong password (should pass)
curl -X POST http://localhost:3002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'
# Expected: 201 Created
```

---

## 🎯 CONFLICT #3: JWT Secret Fallback Vulnerability

### Problem
```typescript
// ← SECURITY VULNERABILITY
const secret = process.env.JWT_SECRET || 'secret';

Result: IF ENV VAR MISSING, USES HARDCODED 'secret'
- Anyone can forge tokens with 'secret'
- Development code leaked to production
- Tokens can be easily intercepted
```

### Current Code (VULNERABLE)
```typescript
const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');
```

### Solution
**Strict JWT configuration with no fallbacks:**

Create `/apps/services/shared/jwt-config.ts`:
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  throw new Error('🔴 CRITICAL: JWT_SECRET must be set in environment variables');
}

if (!JWT_REFRESH_SECRET) {
  throw new Error('🔴 CRITICAL: JWT_REFRESH_SECRET must be set in environment variables');
}

export const generateToken = (payload: any): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
    algorithm: 'HS256',
  });
};

export const generateRefreshToken = (payload: any): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
```

**Update auth controller to use this:**
```typescript
import { generateToken, verifyToken } from '../../../shared/jwt-config';

export const login = async (req: Request, res: Response) => {
  // ... validation code ...
  
  const token = generateToken({ userId: user.id });  // ✅ No fallback
  const refreshToken = generateRefreshToken({ userId: user.id });
  
  res.json({ token, refreshToken });
};
```

### Environment Variables Required
```bash
# Generate strong secrets
openssl rand -hex 32
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Add to .env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_REFRESH_SECRET=f2e1d0c9b8a7z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1
```

---

## 🎯 CONFLICT #4: Database Pool Configuration Mismatch

### Problem
```
globalix-group-backend: max 5, min 0
admin-backend: max 10, min 2

Result: INCONSISTENT CONNECTION HANDLING
- Different pool strategies cause timeouts
- Admin backend handles load better
- Cascading failures under high traffic
```

### Current Code
**globalix-group-backend/src/config/database.ts:**
```typescript
pool: { max: 5, min: 0 },  // ← Too few connections
```

**admin-backend/src/config/database.ts:**
```typescript
pool: { max: 10, min: 2 },  // ← Better, but inconsistent
```

### Solution
**Unified pool configuration:**

```typescript
// Use in BOTH backends
const pool = {
  max: parseInt(process.env.DB_POOL_MAX || '10'),      // ✅ Max 10
  min: parseInt(process.env.DB_POOL_MIN || '2'),       // ✅ Min 2
  acquire: 30000,                                       // ✅ 30s acquire timeout
  idle: 10000,                                          // ✅ 10s idle timeout
};
```

### Pool Configuration Explanation
| Setting | Value | Purpose |
|---------|-------|---------|
| max | 10 | Maximum connections in pool |
| min | 2 | Minimum connections maintained |
| acquire | 30000ms | Timeout to get connection |
| idle | 10000ms | Idle connection timeout |

### Testing Connection Pool
```bash
# Load test with 20 concurrent requests
for i in {1..20}; do
  curl -s http://localhost:3002/api/v1/health &
done
wait

# Monitor connections
psql -U postgres -d restate_db -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'restate_db';"
```

---

## 🎯 CONFLICT #5: Route Nesting Issues

### Problem
```
Admin routes incorrectly nested:
/admin/api/admin/api/auth/login  ← Wrong

Should be:
/api/v1/admin/auth/login  ← Correct
```

### Current Code
**admin-backend/src/routes/index.ts:**
```typescript
// Routes might be nested incorrectly
router.use('/admin', adminRoutes);      // Wrong nesting

// Results in: /admin/admin/auth/login
```

### Solution
**Consistent route structure:**

```typescript
// admin-backend/src/index.ts
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

// Use flat structure
app.use('/api/v1/auth', authRoutes);        // ✅ /api/v1/auth/login
app.use('/api/v1/admin', adminRoutes);      // ✅ /api/v1/admin/users
```

```typescript
// globalix-group-backend/src/index.ts
import authRoutes from './routes/auth';
import carRoutes from './routes/cars';
import propertyRoutes from './routes/properties';

// Same structure
app.use('/api/v1/auth', authRoutes);        // ✅ /api/v1/auth/login
app.use('/api/v1/cars', carRoutes);         // ✅ /api/v1/cars
app.use('/api/v1/properties', propertyRoutes);  // ✅ /api/v1/properties
```

### Verify Routes
```bash
# Get all routes
curl -s http://localhost:3002/api/v1/health | jq .

# Expected output should show:
# /api/v1/auth/*
# /api/v1/cars/*
# /api/v1/properties/*
```

---

## ✅ INTEGRATION CHECKLIST

- [ ] Both backends use `restate_db`
- [ ] Password validation unified (12 chars, complexity required)
- [ ] JWT secrets configured (no hardcoded fallbacks)
- [ ] JWT secrets different (separate for access/refresh tokens)
- [ ] Database pool configuration identical (max 10, min 2)
- [ ] Routes follow `/api/v1/*` pattern consistently
- [ ] Environment variables configured in both .env files
- [ ] PostgreSQL running with `restate_db` created
- [ ] Both backends can authenticate to database
- [ ] Shared auth module accessible from both backends
- [ ] No duplicate route paths
- [ ] Admin routes properly prefixed under `/api/v1/admin`

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Update Database Config (5 min)
```bash
# Copy unified database config to both backends
cp shared/database-config.ts apps/services/globalix-group-backend/src/config/database.ts
cp shared/database-config.ts apps/services/admin-backend/src/config/database.ts
```

### Step 2: Update Auth Validation (5 min)
```bash
# Create shared auth module
mkdir -p apps/services/shared
cp shared/auth-validation.ts apps/services/shared/auth.ts

# Update both auth controllers to import from shared
```

### Step 3: Update JWT Configuration (5 min)
```bash
# Create JWT config module
cp shared/jwt-config.ts apps/services/shared/jwt-config.ts

# Update both auth controllers
```

### Step 4: Update Routes (5 min)
```bash
# Verify route structure in both backends
# Ensure no nested `/admin/api/admin/api` patterns
```

### Step 5: Set Environment Variables (5 min)
```bash
# Generate strong secrets
openssl rand -hex 32  # Run twice

# Create .env in globalix-group-backend
cat > apps/services/globalix-group-backend/.env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restate_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=3002
NODE_ENV=development
EOF

# Create .env in admin-backend
cat > apps/services/admin-backend/.env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restate_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=3000
NODE_ENV=development
EOF
```

### Step 6: Test Integration (10 min)
```bash
# Terminal 1: Start globalix-group-backend
cd apps/services/globalix-group-backend
npm run dev

# Terminal 2: Start admin-backend
cd apps/services/admin-backend
npm run dev

# Terminal 3: Test signup
curl -X POST http://localhost:3002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'

# Terminal 3: Test login from app backend
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'

# Terminal 3: Test that admin can see the user
curl -X GET http://localhost:3000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🔍 TESTING API CONFLICTS

### Test Suite
```bash
cd apps/services/penetration-test-suite
npm test
```

**Expected Results:**
```
✅ SQL Injection Prevention: PASSED
✅ XSS Prevention: PASSED
✅ Authentication Bypass: PASSED
✅ Rate Limiting: PASSED
✅ CORS Validation: PASSED
✅ Password Complexity: PASSED
✅ CSRF Protection: PASSED
✅ Security Headers: PASSED

All Tests Passed: 8/8 ✅
```

---

## ⚠️ TROUBLESHOOTING

### Error: "Database does not exist"
```bash
# Solution: Create restate_db
psql -U postgres -c "CREATE DATABASE restate_db;"
```

### Error: "JWT_SECRET is missing"
```bash
# Solution: Set environment variables
export JWT_SECRET=$(openssl rand -hex 32)
export JWT_REFRESH_SECRET=$(openssl rand -hex 32)
```

### Error: "Connection refused"
```bash
# Solution: Start PostgreSQL
brew services start postgresql@14
```

### Error: "Port already in use"
```bash
# Kill process on port 3002
lsof -ti:3002 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

**All API Conflicts Ready for Resolution! ✅**
