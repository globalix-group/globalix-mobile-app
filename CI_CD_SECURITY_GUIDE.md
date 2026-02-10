# CI/CD Security Workflows - Implementation Guide

## 📋 Overview

This document describes the automated security scanning workflows integrated into the Globalix Group GitHub Actions pipeline. These workflows ensure that all code meets security standards before deployment.

## 🔧 Implemented Security Checks

### 1. CodeQL Analysis (SAST)
**Purpose**: Static Application Security Testing to find code vulnerabilities

**Location**: `.github/workflows/security.yml` → `codeql` job

**What it does**:
- Analyzes JavaScript/TypeScript code for security issues
- Runs on: every push to main/develop, all PRs, and daily schedule
- Checks for: injection flaws, XSS, CSRF, weak cryptography patterns
- Failure criteria: Any HIGH or CRITICAL severity finding blocks the PR

**Configuration**:
```yaml
uses: github/codeql-action/init@v2
with:
  languages: ['javascript', 'typescript']
  queries: security-and-quality
```

### 2. Gitleaks Secret Detection
**Purpose**: Prevents credentials from being committed to the repository

**Location**: `.github/workflows/security.yml` → `gitleaks` job

**What it does**:
- Scans commit history for API keys, tokens, passwords
- Detects: AWS keys, private keys, hardcoded credentials, etc.
- Runs on: every push and PR
- Failure criteria: Any secret pattern detected blocks the PR

**Configuration**:
- False positives managed via `.gitleaksignore`
- Currently ignores demo credentials and placeholder examples
- Can add CVE exceptions as needed

### 3. NPM Audit Dependency Scanning
**Purpose**: Identifies known vulnerabilities in npm dependencies

**Location**: `.github/workflows/security.yml` → `npm-audit` job

**What it does**:
- Scans all package.json files for vulnerable dependencies
- Checks all four services:
  - `apps/services/globalix-group-backend`
  - `apps/services/admin-backend`
  - `apps/mobile/globalix-group-app`
  - `apps/web/admin-dashboard`
- Failure criteria: Any MODERATE severity or higher vulnerability
- Generates detailed audit reports as artifacts

**Configuration**:
```bash
npm audit --audit-level=moderate
```

**Resolution**:
- Run `npm update` to patch security vulnerabilities
- Run `npm audit fix` for automatic fixes (use with caution)
- Document any necessary overrides in `.npmauditignore` if approved

### 4. Trivy Container Image Scanning
**Purpose**: Finds vulnerabilities in Docker images before deployment

**Location**: `.github/workflows/security.yml` → `trivy-scan` job

**What it does**:
- Scans built Docker images for known CVEs
- Scans: globalix-group-backend and admin-backend
- Checks: OS packages, application libraries
- Failure criteria: CRITICAL or HIGH severity vulnerabilities
- Outputs: SARIF format integrated into GitHub Security tab

**Configuration**:
```yaml
severity: 'CRITICAL,HIGH'
format: 'sarif'
```

**Usage**:
- Results appear in repository Security → Code scanning alerts
- Identify vulnerable base images or dependencies
- Update Dockerfiles to use patched versions

### 5. TypeScript Type Checking
**Purpose**: Ensures code type safety and catches common errors

**Location**: `.github/workflows/security.yml` → `type-check` job

**What it does**:
- Runs `tsc --noEmit` on all TypeScript projects
- Checks all four services (backends, mobile, web)
- Failure criteria: Any type errors block the PR

**Configuration**:
```bash
npx tsc --noEmit
```

### 6. Security Best Practices Check
**Purpose**: Verifies adherence to security standards

**Location**: `.github/workflows/security.yml` → `security-headers` job

**What it does**:
- Checks for hardcoded secrets in source code
- Verifies environment variable usage patterns
- Validates security configuration files exist

## 📊 Workflow Triggers

Security checks run automatically in these scenarios:

1. **Push to main branch** → Full security suite
2. **Push to develop branch** → Full security suite
3. **Pull Requests** → Full security suite (blocks merge if fails)
4. **Daily schedule** → Daily comprehensive scan (2 AM UTC)
5. **Manual trigger** (optional) → On-demand security audit

## 🔍 How to View Results

### GitHub Security Tab
1. Go to repository → Security → Code scanning alerts
2. Filter by CodeQL or Trivy
3. Review severity and recommendations
4. Create issues for critical findings

### Pull Request Checks
1. Open any PR
2. Scroll to "Checks" section
3. Expand each check to see details
4. Red X = failed security check (blocks merge)
5. Green ✓ = passed security check

### Artifact Reports
1. Go to repository → Actions → [Latest Run]
2. Scroll to "Artifacts" section
3. Download npm-audit reports and Trivy reports
4. Review JSON files for detailed findings

## 🚀 Local Testing

### Run CodeQL Locally
```bash
# Install CodeQL CLI from https://github.com/github/codeql-cli-bundle
codeql database create my_database --language=typescript --source-root=.
codeql database analyze my_database codeql/typescript-queries
```

### Run Gitleaks Locally
```bash
# Install: brew install gitleaks (macOS) or download from GitHub
gitleaks detect --source . --verbose
```

### Run npm Audit Locally
```bash
# In each service directory
cd apps/services/globalix-group-backend
npm audit
```

### Run Trivy Locally
```bash
# Install: brew install trivy (macOS)
trivy image my-image:latest
trivy fs .
```

## ⚙️ Configuration Files

### `.github/codeql-config.yml`
- Specifies CodeQL query packs
- Defines paths to analyze
- Sets paths to ignore (node_modules, dist, etc.)

### `.gitleaksignore`
- Documents safe patterns (test credentials)
- Prevents false positives
- Examples: `demo@globalix.com`, `Password123!`

### `.trivyignore`
- Manages CVE exceptions
- Format: `CVE-2021-12345 exp:2025-12-31T00:00:00Z`
- Add with justification only for non-exploitable issues

### `SECURITY.md`
- Security policy and contact info
- Vulnerability reporting procedures
- Security standards documentation
- Incident response procedures

## 📋 Checklist for Pull Requests

Before opening a PR, ensure:

- [ ] No hardcoded credentials in code
- [ ] All secrets are in environment variables
- [ ] All new dependencies pass `npm audit`
- [ ] TypeScript compiles with `tsc --noEmit`
- [ ] No high-risk code patterns
- [ ] Updated vulnerable dependencies
- [ ] Security headers properly configured
- [ ] Input validation implemented
- [ ] Error messages don't leak sensitive info

## 🔐 Common Vulnerabilities to Watch For

### In Code Review
- ❌ SQL injection: `db.query(userInput)` → ✅ Use parameterized queries
- ❌ XSS: `innerHTML = userInput` → ✅ Use React/template escaping
- ❌ Hardcoded credentials → ✅ Use environment variables
- ❌ No input validation → ✅ Use express-validator
- ❌ No authentication → ✅ Add JWT middleware
- ❌ Wildcard CORS → ✅ Use allowlist of known origins

### In Dependencies
- ❌ Outdated packages with CVEs
- ❌ Unmaintained packages
- ❌ Transitive dependencies with vulnerabilities

## 📈 Security Metrics

Track these metrics to assess security posture:

| Metric | Target | Frequency |
|--------|--------|-----------|
| CodeQL Issues | 0 HIGH/CRITICAL | Every PR |
| Secrets Leaked | 0 | Every commit |
| Dependency Vulns | 0 MODERATE+ | Daily |
| Container Vulns | 0 CRITICAL/HIGH | Every image |
| Type Errors | 0 | Every PR |
| Failed Audits | 0 | Monthly review |

## 🆘 Troubleshooting

### CodeQL Fails with No Language Found
**Issue**: "No languages found"
**Solution**: Ensure TypeScript is properly detected, check `.github/codeql-config.yml`

### npm Audit Shows False Positive
**Issue**: Package marked vulnerable but not actually exploitable
**Solution**: Document in `.npmauditignore` with justification, add only after review

### Trivy Fails on Base Image CVE
**Issue**: Node:18-alpine has known CVEs
**Solution**: Update to latest Node LTS, review CVE applicability

### Gitleaks Blocks Commit with Test Credential
**Issue**: Test password flagged as secret
**Solution**: Add pattern to `.gitleaksignore` with comment explaining why

## 📚 References

- [GitHub CodeQL Documentation](https://codeql.github.com/)
- [Gitleaks GitHub Repository](https://github.com/gitleaks/gitleaks)
- [npm Audit Documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [Trivy Scanner Documentation](https://aquasecurity.github.io/trivy/)
- [OWASP Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

## 🎯 Next Steps

The following security enhancements are recommended:

1. **Audit Logging** - Log all authentication and data modification events
2. **Centralized Logging** - Aggregate logs with Winston/Pino for analysis
3. **Monitoring & Alerting** - Setup Prometheus + Grafana for metrics
4. **Error Tracking** - Integrate Sentry for production error monitoring
5. **Advanced SIEM** - For compliance requirements

---

**Last Updated**: January 29, 2026
**Status**: ✅ All CI/CD security workflows implemented and tested
