# Globalix Group — System Structure (Feb 24, 2026)

## 1) Workspace Overview
- Root contains documentation, security guides, pitch materials, and quick-start references.
- All executable code lives under apps/.

## 2) Applications and Services
### A) Mobile App (Expo / React Native)
- Path: apps/mobile/globalix-group-app/
- Purpose: End‑user mobile experience for property browsing, luxury car rentals, profiles, media, and chat.
- Key folders:
  - src/: screens, services, theme, navigation, and UI logic.
  - assets/: app assets.
  - constants/: shared constants.
- Runtime: Expo (Metro bundler), React Native.

### B) Web Admin Dashboard (Next.js)
- Path: apps/web/admin-dashboard/
- Purpose: Admin UI for analytics, user management, content moderation, inquiries, earnings.
- Key folders:
  - src/: UI components, pages, state, API client.
  - public/: static assets.
- Runtime: Next.js dev server.

### C) Main Backend API (Express + TypeScript)
- Path: apps/services/globalix-group-backend/
- Purpose: Primary API for mobile and admin dashboard.
- Key areas:
  - src/index.ts: server setup, CORS, routes, sockets, health.
  - src/routes/: REST endpoints (/api/v1/*).
  - src/controllers/: request handlers.
  - src/services/: business logic.
  - src/models/: Sequelize models.
  - src/socket.ts: Socket.IO setup.
- Runtime: Node.js, Express, PostgreSQL.

### D) Admin Backend (Express + TypeScript)
- Path: apps/services/admin-backend/
- Purpose: Admin authentication and admin‑specific endpoints.
- Key areas:
  - src/index.ts: server setup, CORS, routes, health.
  - src/routes/: admin endpoints.
  - src/controllers/, src/services/, src/models/.
- Runtime: Node.js, Express, PostgreSQL.

### E) Shared Service Utilities
- Path: apps/services/
- Files:
  - unified-auth-service.ts
  - unified-database-config.ts
  - admin-security-middleware.ts
  - penetration-test-suite.ts
- Purpose: cross-service helpers and security tooling.

## 3) Primary Data Store
- PostgreSQL used by both backends (Sequelize ORM).
- Core entities: Users, Properties, Cars, Inquiries, Notifications, Contacts, CarReservations, Media, Chats.

## 4) High-Level Request Flow
1. Mobile app (Expo) or Admin Dashboard (Next.js) calls REST API.
2. Main backend serves /api/v1/* and file uploads (/uploads).
3. Admin backend serves admin auth and admin-specific routes.
4. WebSocket (Socket.IO) used for real-time features.

## 5) Environments & Configuration
- Each app/service has its own .env or .env.local.
- Web uses NEXT_PUBLIC_* variables for API endpoints.
- Mobile uses EXPO_PUBLIC_* variables for API base URL.

## 6) Ports (default dev)
- Main backend: 3002
- Admin backend: 3000
- Admin dashboard: 3000 (Next.js dev default) or 3001 if configured
- Expo Metro: 8081

## 7) Documentation Map (root)
- GLOBALIX_PLATFORM_OVERVIEW.md
- SECURITY.md + security hardening guides
- SERVER_STARTUP_GUIDE.md
- DOCUMENTATION_INDEX.md

## 8) Deployment Readiness Notes
- Already structured for a multi-client platform.
- SaaS readiness depends on:
  - Multi-tenant architecture
  - Billing/subscription management
  - Tenant isolation and role-based access
  - Automated onboarding and provisioning

---
If you want, I can add architecture diagrams or environment-specific runbooks.
