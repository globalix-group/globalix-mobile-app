#!/bin/bash
# Pre-commit Security Checklist Script
# Run this before committing code to catch security issues early
# Usage: bash pre-commit-security-check.sh

set -e

echo "🔒 Running Pre-Commit Security Checks..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_failed=false

# Check 1: Look for hardcoded secrets
echo "📋 Checking for hardcoded secrets..."
if grep -r "password\s*=\s*['\"]" --include="*.ts" --include="*.js" --exclude-dir=node_modules . 2>/dev/null | grep -v "// " | grep -v "/\*" | head -5; then
    echo -e "${RED}❌ Found potential hardcoded secrets${NC}"
    check_failed=true
else
    echo -e "${GREEN}✓ No obvious hardcoded secrets detected${NC}"
fi
echo ""

# Check 2: Verify environment variable usage
echo "📋 Checking environment variable security..."
if grep -r "process\.env\." apps/services --include="*.ts" 2>/dev/null | grep -v "JWT_" | grep -v "DB_" | grep -v "NODE_ENV" | grep -v "PORT" | grep -v "CORS_ORIGIN" | grep -v "ADMIN_" | head -3; then
    echo -e "${YELLOW}⚠️  Found environment variables - verify they're safe${NC}"
else
    echo -e "${GREEN}✓ Environment variables properly scoped${NC}"
fi
echo ""

# Check 3: TypeScript compilation
echo "📋 Checking TypeScript compilation..."
for service in "apps/services/globalix-group-backend" "apps/services/admin-backend" "apps/mobile/globalix-group-app" "apps/web/admin-dashboard"; do
    if [ -f "$service/tsconfig.json" ]; then
        if cd "$service" && npx tsc --noEmit 2>/dev/null; then
            echo -e "${GREEN}✓ $service compiles without errors${NC}"
        else
            echo -e "${RED}❌ $service has TypeScript errors${NC}"
            check_failed=true
        fi
        cd - > /dev/null
    fi
done
echo ""

# Check 4: npm audit
echo "📋 Running npm audit on critical services..."
for service in "apps/services/globalix-group-backend" "apps/services/admin-backend"; do
    if [ -d "$service/node_modules" ]; then
        if cd "$service" && npm audit --audit-level=moderate --quiet 2>/dev/null; then
            echo -e "${GREEN}✓ $service has no moderate+ vulnerabilities${NC}"
        else
            echo -e "${YELLOW}⚠️  $service has vulnerabilities - review with 'npm audit'${NC}"
        fi
        cd - > /dev/null
    fi
done
echo ""

# Check 5: Look for console.log in production code
echo "📋 Checking for debug logging in production code..."
if grep -r "console\.\(log\|debug\)" apps/services --include="*.ts" 2>/dev/null | grep -v "// console" | grep -v "TODO" | head -3; then
    echo -e "${YELLOW}⚠️  Found console logging - remove before deploying to production${NC}"
else
    echo -e "${GREEN}✓ No problematic console logging found${NC}"
fi
echo ""

# Check 6: Validate environment files
echo "📋 Checking .env files..."
if [ -f ".env" ]; then
    if grep -q "JWT_SECRET=change-me" .env; then
        echo -e "${RED}❌ JWT_SECRET not changed from default!${NC}"
        check_failed=true
    else
        echo -e "${GREEN}✓ Sensitive variables configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No .env file found - ensure environment variables are set${NC}"
fi
echo ""

# Check 7: Look for SQL injection patterns
echo "📋 Checking for potential SQL injection..."
if grep -r "query(.*\+" apps/services --include="*.ts" 2>/dev/null | grep -v "findAll\|findByPk" | head -2; then
    echo -e "${RED}❌ Found potential SQL injection pattern - use parameterized queries${NC}"
    check_failed=true
else
    echo -e "${GREEN}✓ No obvious SQL injection patterns${NC}"
fi
echo ""

# Check 8: Verify no API keys in comments
echo "📋 Checking for exposed API keys in comments..."
if grep -r "sk_\|pk_\|api_key\|apikey\|token.*=" --include="*.ts" --include="*.js" --exclude-dir=node_modules . 2>/dev/null | grep -i "actual\|real\|live" | head -2; then
    echo -e "${RED}❌ Found potential exposed API credentials${NC}"
    check_failed=true
else
    echo -e "${GREEN}✓ No obvious exposed credentials${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$check_failed" = true ]; then
    echo -e "${RED}⚠️  Some security checks failed!${NC}"
    echo "Please address the issues above before committing."
    echo ""
    echo "For help: See SECURITY.md and CI_CD_SECURITY_GUIDE.md"
    exit 1
else
    echo -e "${GREEN}✅ All pre-commit security checks passed!${NC}"
    echo "Ready to commit."
    exit 0
fi
