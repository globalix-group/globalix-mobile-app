import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// ===== SOPHISTICATED ADMIN SECURITY MIDDLEWARE =====

declare global {
  namespace Express {
    interface Request {
      adminId?: string;
      adminEmail?: string;
      adminIp?: string;
      adminUserAgent?: string;
      mfaVerified?: boolean;
    }
  }
}

// ===== ADMIN RATE LIMITING =====
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many admin login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for non-admin endpoints
    return !req.path.includes('/admin') || !req.path.includes('/login');
  },
  keyGenerator: (req: Request) => {
    // Rate limit by IP + email combination
    return `${req.ip}-${req.body?.email || 'unknown'}`;
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many admin login attempts. Please try again in 15 minutes.',
        statusCode: 429,
        retryAfter: 900, // 15 minutes in seconds
      },
    });
  },
});

export const adminApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip || 'unknown',
});

// ===== IP WHITELIST CHECK =====
const ADMIN_IP_WHITELIST = (process.env.ADMIN_IP_WHITELIST || '').split(',').filter(Boolean);

export const ipWhitelistMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (ADMIN_IP_WHITELIST.length === 0) {
    // If no whitelist is configured, allow all (for development)
    return next();
  }

  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

  if (!ADMIN_IP_WHITELIST.includes(clientIp)) {
    console.warn(`⚠️ Unauthorized IP attempted admin access: ${clientIp}`);
    return res.status(403).json({
      success: false,
      error: {
        code: 'IP_NOT_WHITELISTED',
        message: 'Your IP address is not authorized for admin access',
        statusCode: 403,
        requestedIp: clientIp,
      },
    });
  }

  next();
};

// ===== MFA VERIFICATION MIDDLEWARE =====
export const mfaVerificationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if MFA is enabled for this admin
  const mfaRequired = process.env.ADMIN_MFA_REQUIRED === 'true';

  if (!mfaRequired) {
    return next();
  }

  if (!req.mfaVerified) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'MFA_REQUIRED',
        message: 'Multi-factor authentication required',
        statusCode: 403,
      },
    });
  }

  next();
};

// ===== ADMIN ACTION AUDIT LOGGING =====
export interface AdminAuditLog {
  adminId: string;
  adminEmail: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'VIEW' | 'MFA_VERIFY' | 'MFA_SETUP';
  resourceType?: string;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  statusCode?: number;
  timestamp: Date;
  details?: Record<string, any>;
}

// In-memory audit log for now (in production, store in database)
const auditLogs: AdminAuditLog[] = [];

export const auditLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (body: any) {
    // Log the request after response
    if (req.adminId && body.success) {
      const log: AdminAuditLog = {
        adminId: req.adminId,
        adminEmail: req.adminEmail || 'unknown',
        action: determineAction(req),
        resourceType: getResourceType(req),
        resourceId: getResourceId(req),
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        statusCode: res.statusCode,
        timestamp: new Date(),
      };

      auditLogs.push(log);

      // Keep only last 10,000 logs in memory
      if (auditLogs.length > 10000) {
        auditLogs.shift();
      }

      console.log(`📝 Admin Audit: ${log.adminEmail} - ${log.action} - ${log.resourceType}`);
    }

    return originalJson.call(this, body);
  };

  next();
};

function determineAction(req: Request): AdminAuditLog['action'] {
  if (req.path.includes('login')) return 'LOGIN';
  if (req.path.includes('logout')) return 'LOGOUT';
  if (req.path.includes('mfa') && req.method === 'POST') return 'MFA_SETUP';
  if (req.method === 'POST') return 'CREATE';
  if (req.method === 'PUT' || req.method === 'PATCH') return 'UPDATE';
  if (req.method === 'DELETE') return 'DELETE';
  if (req.path.includes('export')) return 'EXPORT';
  return 'VIEW';
}

function getResourceType(req: Request): string {
  if (req.path.includes('users')) return 'user';
  if (req.path.includes('properties')) return 'property';
  if (req.path.includes('cars')) return 'car';
  if (req.path.includes('payments')) return 'payment';
  if (req.path.includes('admin')) return 'admin';
  return 'unknown';
}

function getResourceId(req: Request): string | undefined {
  const match = req.path.match(/\/(\d+)/);
  return match ? match[1] : undefined;
}

export const getAuditLogs = (adminId?: string, limit: number = 100): AdminAuditLog[] => {
  let logs = [...auditLogs];
  if (adminId) {
    logs = logs.filter((log) => log.adminId === adminId);
  }
  return logs.slice(-limit).reverse();
};

// ===== ADMIN SESSION MANAGEMENT =====
export interface AdminSession {
  sessionId: string;
  adminId: string;
  adminEmail: string;
  ipAddress: string;
  userAgent: string;
  mfaVerified: boolean;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  revoked: boolean;
}

const activeSessions = new Map<string, AdminSession>();

export const createAdminSession = (
  sessionId: string,
  adminId: string,
  adminEmail: string,
  ipAddress: string,
  userAgent: string,
  mfaVerified: boolean = false
): AdminSession => {
  const session: AdminSession = {
    sessionId,
    adminId,
    adminEmail,
    ipAddress,
    userAgent,
    mfaVerified,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    lastActivityAt: new Date(),
    revoked: false,
  };

  activeSessions.set(sessionId, session);
  return session;
};

export const getAdminSession = (sessionId: string): AdminSession | undefined => {
  const session = activeSessions.get(sessionId);
  if (!session || session.revoked) {
    return undefined;
  }

  // Check if session has expired
  if (new Date() > session.expiresAt) {
    activeSessions.delete(sessionId);
    return undefined;
  }

  // Update last activity
  session.lastActivityAt = new Date();

  return session;
};

export const revokeAdminSession = (sessionId: string) => {
  const session = activeSessions.get(sessionId);
  if (session) {
    session.revoked = true;
  }
};

export const revokeAllAdminSessions = (adminId: string) => {
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.adminId === adminId) {
      session.revoked = true;
    }
  }
};

export const listAdminSessions = (adminId: string): AdminSession[] => {
  const sessions: AdminSession[] = [];
  for (const session of activeSessions.values()) {
    if (session.adminId === adminId && !session.revoked) {
      sessions.push(session);
    }
  }
  return sessions;
};

// ===== SECURITY HEADERS MIDDLEWARE =====
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (formerly Feature policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  next();
};

// ===== ADMIN SESSION VALIDATION MIDDLEWARE =====
export const adminSessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.headers['x-admin-session-id'] as string;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_SESSION_ID',
        message: 'Admin session ID required',
        statusCode: 401,
      },
    });
  }

  const session = getAdminSession(sessionId);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_SESSION',
        message: 'Admin session invalid or expired',
        statusCode: 401,
      },
    });
  }

  req.adminId = session.adminId;
  req.adminEmail = session.adminEmail;
  req.adminIp = session.ipAddress;
  req.adminUserAgent = session.userAgent;
  req.mfaVerified = session.mfaVerified;

  next();
};

export default {
  adminLoginLimiter,
  adminApiLimiter,
  ipWhitelistMiddleware,
  mfaVerificationMiddleware,
  auditLoggingMiddleware,
  securityHeadersMiddleware,
  adminSessionMiddleware,
  createAdminSession,
  getAdminSession,
  revokeAdminSession,
  revokeAllAdminSessions,
  listAdminSessions,
  getAuditLogs,
};
