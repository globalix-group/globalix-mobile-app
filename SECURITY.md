# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in the Globalix Platform, please email security@globalix.com with:

1. **Description**: Clear explanation of the vulnerability
2. **Location**: Specific file path or component affected
3. **Impact**: Potential impact on the system
4. **Reproduction Steps**: Steps to reproduce (if applicable)
5. **Suggested Fix**: Any mitigation or fix recommendations

**Do not disclose vulnerabilities publicly** until we have had time to address them.

## Security Standards

This project implements the following security standards:

### Static Application Security Testing (SAST)
- **Tool**: CodeQL (GitHub)
- **Language Coverage**: TypeScript, JavaScript
- **Schedule**: On every push to main/develop and daily
- **Failure Criteria**: High/Medium severity issues block merge

### Secret Detection
- **Tool**: Gitleaks
- **Scope**: All commits
- **Action**: Prevents commits containing API keys, tokens, passwords
- **False Positives**: Managed via `.gitleaksignore`

### Dependency Vulnerability Scanning
- **Tool**: npm audit
- **Level**: Moderate and above
- **Coverage**: All applications and services
- **Schedule**: On every push and daily

### Container Image Scanning
- **Tool**: Trivy
- **Scope**: Docker images for all backend services
- **Severity**: CRITICAL and HIGH level vulnerabilities
- **Output**: SARIF format integrated into GitHub Security tab

### Code Quality & Type Safety
- **Tool**: TypeScript strict mode
- **All Projects**: Must pass `tsc --noEmit` with zero errors
- **Coverage**: Backends, mobile app, web dashboard

## Compliance Requirements

### Data Protection
- All sensitive data encrypted at rest and in transit
- Personal information processed according to privacy policy
- No credentials hardcoded in source code

### Authentication & Authorization
- JWT-based authentication with expiring tokens
- Refresh token rotation mechanism
- Password hashing with bcryptjs (minimum cost: 10)
- Rate limiting on authentication endpoints (30 req/15min)

### API Security
- HTTPS/TLS enforcement in production
- CORS allowlist (no wildcard)
- Rate limiting (300 req/15min globally, stricter for sensitive endpoints)
- Request validation with express-validator
- Security headers via helmet

### Logging & Monitoring
- All authentication attempts logged
- Security events tracked for audit trail
- Error logs don't expose sensitive data
- Monitoring configured for suspicious patterns

## Environment Variables

### Required for Production
```bash
# Authentication
JWT_SECRET=<long-random-string-min-32-chars>
JWT_REFRESH_SECRET=<long-random-string-min-32-chars>

# Database
DB_HOST=<postgresql-host>
DB_USER=<database-user>
DB_PASSWORD=<strong-password>
DB_NAME=globalix
DB_PORT=5432

# API Configuration
NODE_ENV=production
PORT=3002 (backend) / 3000 (admin)
CORS_ORIGIN=https://yourdomain.com
```

### Never Commit
- API keys
- Database credentials
- JWT secrets
- API tokens
- Private keys

## Secure Development Practices

### Before Committing
1. Run `npm audit` - ensure no critical vulnerabilities
2. Run `tsc --noEmit` - ensure type safety
3. Check for hardcoded secrets with `git diff`
4. Use environment variables for all credentials

### Code Review
All pull requests must:
- Pass all automated security checks (CodeQL, Gitleaks, npm audit, Trivy)
- Be reviewed by at least one team member
- Have no critical/high severity findings

### Dependencies
- Keep dependencies up to date
- Review security advisories regularly
- Use `npm ci` in CI/CD (reproducible installs)
- Regularly run `npm audit fix` for patches

## Incident Response

If a vulnerability is discovered in production:

1. **Immediate**: Disable affected functionality if critical
2. **Assess**: Determine impact and affected users
3. **Patch**: Develop and test security fix
4. **Deploy**: Roll out fix with monitoring
5. **Communicate**: Notify affected users if required
6. **Document**: Create incident report and update preventive measures

## Security Checklist

- [ ] All endpoints validate input with express-validator
- [ ] Sensitive data is never logged
- [ ] Rate limiting is configured appropriately
- [ ] CORS is restricted to known origins
- [ ] Authentication is required for sensitive endpoints
- [ ] Database credentials are environment variables
- [ ] Helmet is configured for production
- [ ] HTTPS/TLS is enforced in production
- [ ] Security headers are set correctly
- [ ] Dependencies are scanned and up to date
- [ ] Error messages don't expose internal details
- [ ] Failed login attempts are rate-limited
- [ ] Token expiration is enforced
- [ ] No secrets in Docker images or git history

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [GitHub Security Overview](https://docs.github.com/en/code-security)
