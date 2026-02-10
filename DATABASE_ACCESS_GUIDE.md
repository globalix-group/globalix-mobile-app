# 📊 GLOBALIX DATABASE ACCESS & CONNECTION GUIDE
## Complete Setup Instructions

**Date:** February 9, 2026  
**Status:** Ready to Deploy  
**Last Updated:** 2026-02-09

---

## 🗄️ DATABASE INFORMATION

### Primary Database
```
Database Name: restate_db
Database Type: PostgreSQL
Version: 12+
Host: localhost (development) or configurable
Port: 5432
Encoding: UTF-8
Timezone: UTC
```

### Database Purpose
- Single unified database for BOTH backends
- Stores all users, properties, cars, transactions
- Centralized audit logs and admin sessions
- Real-time analytics and reporting

---

## 🔐 DATABASE CREDENTIALS

### Default Credentials (Development)
```
Username: postgres
Password: [CONFIGURE IN .env FILE]
Host: localhost
Port: 5432
```

### Secure Credentials (Production)
```
MUST be set via environment variables
NEVER commit passwords to git
NEVER use default credentials
USE strong, random passwords (20+ characters)
```

---

## 📝 ENVIRONMENT VARIABLES

### Create `.env` file in each backend:

**For globalix-group-backend:**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restate_db
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_secret_key_at_least_32_chars_random
JWT_REFRESH_SECRET=your_refresh_secret_at_least_32_chars_random

# Server Configuration
PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:8081,http://localhost:3001

# Admin IP Whitelist (optional)
ADMIN_IP_WHITELIST=127.0.0.1,192.168.1.100
```

**For admin-backend:**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restate_db
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_secret_key_at_least_32_chars_random

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001

# Admin MFA
ADMIN_MFA_REQUIRED=true
```

---

## 🚀 DATABASE SETUP INSTRUCTIONS

### Step 1: Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows (Installer):**
- Download from postgresql.org
- Run installer
- Remember the password you set

### Step 2: Create Database

**Connect to PostgreSQL:**
```bash
psql -U postgres
```

**Create database:**
```sql
-- Create the main database
CREATE DATABASE restate_db 
  WITH 
  OWNER postgres 
  ENCODING 'UTF8' 
  LC_COLLATE 'en_US.UTF-8' 
  LC_CTYPE 'en_US.UTF-8';

-- Verify creation
\list

-- Connect to it
\connect restate_db

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Check extensions
\dx

-- Exit
\quit
```

### Step 3: Set Database Password

```bash
psql -U postgres -d restate_db
```

```sql
ALTER USER postgres WITH PASSWORD 'your_new_secure_password';
```

---

## 🔄 DATABASE CONNECTION POOLING

### Connection Pool Configuration

**globalix-group-backend:**
```
Max connections: 10
Min connections: 2
Acquire timeout: 30 seconds
Idle timeout: 10 seconds
```

**admin-backend:**
```
Max connections: 10
Min connections: 2
Acquire timeout: 30 seconds
Idle timeout: 10 seconds
```

### Why Connection Pooling?
- ✅ Reduces connection overhead
- ✅ Improves performance under load
- ✅ Prevents connection exhaustion
- ✅ Enables concurrent requests

---

## 📋 DATABASE SCHEMA

### Core Tables

#### 1. `users` Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  date_of_birth DATE,
  kyc_verified BOOLEAN DEFAULT false,
  kyc_document_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 2. `user_roles` Table
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user', 'agent', 'admin'
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INTEGER REFERENCES users(id),
  CONSTRAINT valid_role CHECK (role IN ('user', 'agent', 'admin'))
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

#### 3. `properties` Table
```sql
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'penthouse', 'villa', 'estate', 'commercial', 'condo'
  price DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqft INTEGER,
  amenities JSON,
  images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_category ON properties(category);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_location ON properties(location);
```

#### 4. `cars` Table
```sql
CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(50),
  price_per_day DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  location VARCHAR(255),
  capacity INTEGER,
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  status VARCHAR(50) DEFAULT 'available', -- 'available', 'rented', 'maintenance'
  images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_cars_user_id ON cars(user_id);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_price_per_day ON cars(price_per_day);
```

#### 5. `inquiries` Table
```sql
CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  property_id INTEGER REFERENCES properties(id),
  car_id INTEGER REFERENCES cars(id),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'replied', 'closed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
```

#### 6. `admin_audit_logs` Table
```sql
CREATE TABLE admin_audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'
  resource_type VARCHAR(50), -- 'user', 'property', 'car', 'payment'
  resource_id BIGINT,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status_code INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_timestamp ON admin_audit_logs(timestamp);
CREATE INDEX idx_admin_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
```

#### 7. `admin_sessions` Table
```sql
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  mfa_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT false
);

CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);
```

#### 8. `mfa_codes` Table
```sql
CREATE TABLE mfa_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  secret VARCHAR(255) NOT NULL, -- Encrypted TOTP secret
  backup_codes TEXT NOT NULL, -- JSON array, encrypted
  enabled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mfa_codes_user_id ON mfa_codes(user_id);
```

#### 9. `login_attempts` Table
```sql
CREATE TABLE login_attempts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  ip_address VARCHAR(45),
  success BOOLEAN,
  attempt_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason_if_failed VARCHAR(255)
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_timestamp ON login_attempts(attempt_timestamp);
```

---

## 🔑 DATABASE ACCESS METHODS

### Method 1: Command Line (psql)

**Connect to database:**
```bash
psql -h localhost -p 5432 -U postgres -d restate_db
```

**Useful commands:**
```sql
-- List all tables
\dt

-- Describe a table
\d users

-- Query users
SELECT * FROM users LIMIT 5;

-- Exit
\quit
```

### Method 2: GUI Tools

**DBeaver (Recommended):**
- Download: dbeaver.io
- Connect: New Database Connection → PostgreSQL
- Host: localhost, Port: 5432, Database: restate_db

**pgAdmin:**
- Download: pgadmin.pgadmin.org
- Web-based interface
- Create server connection

**VS Code Extension:**
- Install: PostgreSQL (by Chris Kolkman)
- Connect in sidebar

### Method 3: Application Connection

**Node.js with Sequelize (Already configured):**
```typescript
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'restate_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

await sequelize.authenticate();
console.log('✅ Connected to database');
```

---

## 🔍 DATABASE MONITORING

### Check Database Size
```sql
SELECT 
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'restate_db';
```

### Check Active Connections
```sql
SELECT 
  count(*) AS active_connections,
  state
FROM pg_stat_activity
WHERE datname = 'restate_db'
GROUP BY state;
```

### Check Slow Queries
```sql
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Check Index Usage
```sql
SELECT 
  relname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 💾 BACKUP & RESTORE

### Backup Database

**Full backup:**
```bash
pg_dump -h localhost -U postgres -d restate_db > backup_restate_db.sql
```

**Compressed backup:**
```bash
pg_dump -h localhost -U postgres -d restate_db | gzip > backup_restate_db.sql.gz
```

### Restore Database

**From SQL file:**
```bash
psql -h localhost -U postgres -d restate_db < backup_restate_db.sql
```

**From compressed file:**
```bash
gunzip -c backup_restate_db.sql.gz | psql -h localhost -U postgres -d restate_db
```

---

## ✅ VERIFICATION CHECKLIST

After setup, verify everything works:

- [ ] PostgreSQL is running
- [ ] Database `restate_db` created
- [ ] User `postgres` can authenticate
- [ ] Connection pooling configured
- [ ] All tables created
- [ ] Indexes created
- [ ] .env files configured
- [ ] Backend services can connect
- [ ] Admin audit logging working
- [ ] Data persists after restart

---

## 🚀 STARTUP COMMANDS

**Terminal 1: Start PostgreSQL**
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Or run in foreground (development)
postgres -D /usr/local/var/postgres
```

**Terminal 2: Start globalix-group-backend**
```bash
cd apps/services/globalix-group-backend
npm install
npm run dev
# Runs on port 3002
```

**Terminal 3: Start admin-backend**
```bash
cd apps/services/admin-backend
npm install
npm run dev
# Runs on port 3000
```

**Terminal 4: Start admin-dashboard**
```bash
cd apps/web/admin-dashboard
npm install
npm run dev
# Runs on port 3001
```

**Terminal 5: Start mobile app**
```bash
cd apps/mobile/globalix-group-app
npm install
npm start
# Expo on port 8081
```

---

## 📞 TROUBLESHOOTING

### "Connection refused" Error
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Start PostgreSQL
brew services start postgresql@14
```

### "Database does not exist" Error
```bash
# List databases
psql -U postgres -l

# Create database if missing
createdb -U postgres restate_db
```

### "Password authentication failed" Error
```bash
# Reset PostgreSQL password
psql -U postgres

ALTER USER postgres WITH PASSWORD 'newpassword';
\quit
```

### "Too many connections" Error
```bash
# Check connection limit
SHOW max_connections;

# Disconnect idle connections
SELECT pid, usename, application_name 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND query_start < now() - interval '10 minutes';
```

---

**Database Access Setup Complete! ✅**

Need help? Check the full API_SECURITY_AND_CONFLICTS_REPORT.md for more information.
