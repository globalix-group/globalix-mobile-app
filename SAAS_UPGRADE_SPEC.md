# Globalix Marketplace SaaS — Production Upgrade Spec
Date: 2026‑02‑24

## Executive Summary
Upgrade the existing marketplace into a production‑grade, multi‑tenant SaaS with AI‑powered, explainable insights. Tenants are real estate agencies and car dealerships. The system uses shared PostgreSQL with `tenant_id` row‑level isolation, Stripe billing, and plan‑gated AI features.

## 1) SaaS Architecture Diagram (Text‑Based)
Client Apps
- Mobile App (buyers)
- Admin Dashboard (tenant admins, agents, platform admins)

Edge & Identity
- API Gateway / Load Balancer
- Auth Service (JWT + refresh)
- SSO (enterprise only)

Core Services
- Listings Service (properties, cars)
- Inquiries & Leads Service
- Media Service (uploads, CDN)
- Analytics Service
- Admin & Tenant Management Service
- Billing Service (Stripe)
- AI Insights Service (tenant‑scoped, async)

Data & Infra
- PostgreSQL (shared DB, `tenant_id`)
- Object Storage (S3‑compatible)
- Cache (Redis)
- Search (optional: OpenSearch)
- Observability (Sentry + Prometheus/Grafana)

Flow
1) Client → API Gateway → Auth → Core Services
2) Core Services → PostgreSQL (tenant‑scoped)
3) AI Insights Service → feature store → insight generation → approval workflow
4) Billing Service → Stripe webhooks → plan enforcement

## 2) Multi‑Tenant Data Model (High‑Level)
New entities
- `Tenant`: id, name, plan_id, status, branding, data_retention_policy
- `TenantUser`: user_id, tenant_id, role, status
- `Subscription`: tenant_id, stripe_customer_id, stripe_subscription_id, plan_id, limits
- `FeatureFlag`: tenant_id, key, enabled
- `AiInsight`: tenant_id, entity_type, entity_id, explanation, confidence, status
- `AuditLog`: tenant_id, actor_id, action, metadata

Tenant‑scoped entities (add `tenant_id` + indexes)
- `User`, `Property`, `Car`, `Inquiry`, `Listing`, `Media`, `Chat`, `AiInsight`

Shared/global entities
- `Plan`, `SystemConfig`

Indexes
- Composite indexes on (`tenant_id`, `createdAt`), (`tenant_id`, `status`), (`tenant_id`, `entity_id`)

## 3) Roles & Permission Strategy
Roles
- Platform Super Admin
- Tenant Owner
- Tenant Admin
- Agent
- End User (Buyer)

Rules
- Platform admins can manage tenants, plans, suspensions, compliance exports.
- Tenant admins can manage tenant users, listings, inquiries, insights.
- Agents can manage assigned listings and leads.
- End users can browse and submit inquiries only.
- All access checked by `tenant_id` + role.

## 4) Billing & Plan Enforcement
Stripe
- Products: Starter, Pro, Enterprise
- Meters: listings count, AI requests
- Trial: 14 days

Enforcement
- Middleware checks plan limits per request.
- Feature flags gate AI endpoints and white‑label branding.
- Webhooks update subscription status and plan limits.

## 5) AI System Prompts (Explainable, Human‑in‑the‑Loop)
System prompt
- “You are a tenant‑scoped insights engine. Never access or infer cross‑tenant data. Avoid raw PII. Provide explainable recommendations only. Output confidence and rationale. Require human approval.”

User prompt template
- “Analyze tenant_id={tenant_id}, entity={entity_type}:{entity_id}. Summarize performance, predict buyer intent, and recommend actions. Provide confidence and data‑driven rationale.”

Guardrails
- Reject prompts without `tenant_id`.
- Strip PII from context (email, phone, address where prohibited).
- Output structured JSON (summary, recommendation, confidence, rationale, data_sources).

## 6) Backend API Examples (Contract‑Level)
Tenant‑scoped
- `GET /api/v1/tenants/:tenantId/listings`
- `POST /api/v1/tenants/:tenantId/inquiries`
- `GET /api/v1/tenants/:tenantId/insights?entity=listing&entityId=...`

Platform‑level
- `POST /api/v1/platform/tenants`
- `PATCH /api/v1/platform/tenants/:tenantId/suspend`
- `GET /api/v1/platform/metrics`

Billing
- `POST /api/v1/billing/checkout`
- `POST /api/v1/billing/webhooks/stripe`

## 7) AI Request/Response Flow
1) Client requests insights (tenant‑scoped).
2) API verifies plan + tenant role.
3) AI service builds sanitized context (no PII) and calls model.
4) AI response stored as `AiInsight` with `pending` status.
5) Human approval workflow updates to `approved`.

## 8) Security Guardrails
- Enforce `tenant_id` in every query.
- Row‑level filtering in ORM and service layer.
- Audit logs for admin actions.
- Secrets stored in AWS Secrets Manager.
- Rate limits per tenant and per user.
- Optional IP allowlist for enterprise.

## 9) Migration Checklist
- Add `Tenant` table and `tenant_id` columns.
- Backfill data to a default tenant.
- Add tenant guards in controllers/services.
- Add plan limits and feature flags.
- Run data integrity checks and index validation.

## 10) Recruiter‑Ready AI Explanation
AI is used to scale marketplace intelligence: it detects high‑intent buyers and underperforming listings, enabling faster pricing decisions and lead follow‑up. Insights are tenant‑scoped, explainable, and human‑approved to reduce risk. This demonstrates production‑grade AI integration, privacy constraints, and enterprise readiness.

## Implementation Notes
- Keep existing mobile and admin clients; introduce tenant‑aware auth and onboarding.
- Add new admin UI for tenant management and billing.
- Use async jobs for AI to protect API p95 < 300ms.

If you want, I can start implementing the `tenant_id` migrations, Stripe billing, and AI service scaffolding.