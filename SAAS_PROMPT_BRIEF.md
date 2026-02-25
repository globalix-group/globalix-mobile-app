# SaaS Prompt Brief — What to Tell the Assistant

Use this document as a checklist and copy‑paste prompt when you want help building or upgrading the platform into a SaaS. Fill in the blanks, then send to the assistant.

---

## 1) Business & Target Customers
- Product name:
- Industry / niche:
- Target customer types (e.g., real estate agencies, car rental companies):
- Pricing model (monthly, annual, usage‑based, freemium):
- Monetization goals:
- Competitors / references:

## 2) Tenancy Model (Required for SaaS)
- Tenant definition (company/agency/organization):
- Multi‑tenant model preference:
  - Shared DB + tenant_id
  - Separate schema per tenant
  - Separate database per tenant
- Tenant isolation level needed (low/medium/high):
- Data residency or compliance needs (GDPR, SOC2, HIPAA, etc.):

## 3) Roles & Permissions
- Roles required (owner/admin/manager/agent/user):
- Permissions per role:
- Super‑admin capabilities:
- Tenant admin vs global admin separation:

## 4) Billing & Subscriptions
- Billing provider preference (Stripe/Paddle/Chargebee):
- Subscription tiers and limits:
- Usage metering needs:
- Trial length and upgrade flow:
- Invoices/tax requirements:

## 5) Core Features (MVP Scope)
- Must‑have features:
- Nice‑to‑have features:
- Feature flags needed:
- SLA or performance requirements:

## 6) Data Model Changes
- Entities that must be tenant‑scoped (Users, Properties, Cars, Inquiries, Media, Chats, etc.):
- Shared/global entities (if any):
- Migration strategy preference:

## 7) APIs & Integrations
- External services (email, SMS, payments, maps, storage, analytics):
- OAuth providers:
- Webhooks required:

## 8) Security & Compliance
- Authentication method (JWT/OAuth/SSO):
- SSO required? (Okta/Google Workspace):
- Audit log requirements:
- Data retention policy:
- IP allowlist/geo restrictions:

## 9) Observability & Operations
- Logging standard (structured JSON logs):
- Error tracking (Sentry):
- Metrics (Prometheus/Grafana):
- Uptime monitoring:

## 10) Deployment & Environments
- Hosting preference (AWS/GCP/Azure/Render):
- Environment setup (dev/staging/prod):
- CI/CD requirements:
- Infrastructure as code (Terraform) needed?

## 11) UX & Branding
- Tenant‑level branding (logo/colors/custom domain):
- Theming needs:
- White‑label requirement:

---

## Copy‑Paste Prompt Template

“Please upgrade Globalix into a SaaS. Here are the details:

1) Business & Target Customers
- Product name: [name]
- Industry / niche: [niche]
- Target customers: [types]
- Pricing model: [model]
- Monetization goals: [goals]
- Competitors: [refs]

2) Tenancy Model
- Tenant definition: [definition]
- Multi‑tenant model: [shared DB + tenant_id | schema per tenant | DB per tenant]
- Isolation level: [low/medium/high]
- Compliance: [requirements]

3) Roles & Permissions
- Roles: [roles]
- Permissions: [notes]
- Super‑admin: [capabilities]
- Admin separation: [notes]

4) Billing
- Provider: [Stripe/Paddle/etc]
- Tiers and limits: [tiers]
- Usage metering: [yes/no]
- Trial length: [days]
- Invoices/tax: [needs]

5) Core Features
- Must‑have: [list]
- Nice‑to‑have: [list]
- Feature flags: [yes/no]
- SLA/perf: [targets]

6) Data Model
- Tenant‑scoped entities: [list]
- Shared entities: [list]
- Migration strategy: [plan]

7) APIs & Integrations
- External services: [list]
- OAuth providers: [list]
- Webhooks: [list]

8) Security & Compliance
- Auth method: [JWT/OAuth/SSO]
- SSO: [yes/no]
- Audit logs: [yes/no]
- Data retention: [policy]
- IP/geo restrictions: [needs]

9) Observability
- Logging: [standard]
- Error tracking: [tool]
- Metrics: [tool]
- Uptime: [tool]

10) Deployment
- Hosting: [platform]
- Environments: [dev/staging/prod]
- CI/CD: [requirements]
- IaC: [yes/no]

11) UX & Branding
- Tenant branding: [yes/no]
- Theming: [needs]
- White‑label: [yes/no]

Please produce a step‑by‑step plan and implement code changes where possible.”
