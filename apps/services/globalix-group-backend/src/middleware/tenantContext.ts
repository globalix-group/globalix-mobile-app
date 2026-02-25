import { Request, Response, NextFunction } from 'express';
import { User } from '../models';

const TENANT_HEADER_KEYS = ['x-tenant-id', 'x-tenant'] as const;

const resolveTenantFromHeaders = (req: Request): string | null => {
  for (const key of TENANT_HEADER_KEYS) {
    const value = req.headers[key] as string | string[] | undefined;
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (Array.isArray(value) && value.length > 0 && value[0]?.trim()) return value[0].trim();
  }
  return null;
};

export const tenantContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.path.startsWith('/billing/webhooks/stripe')) {
      return next();
    }

    const headerTenantId = resolveTenantFromHeaders(req);
    if (headerTenantId) {
      req.tenantId = headerTenantId;
      return next();
    }

    if (req.userId) {
      const user = await User.findByPk(req.userId, { attributes: ['id', 'tenantId'] });
      if (user && (user as any).tenantId) {
        req.tenantId = (user as any).tenantId as string;
        return next();
      }
    }

    if (process.env.DEFAULT_TENANT_ID) {
      req.tenantId = process.env.DEFAULT_TENANT_ID;
      return next();
    }

    return res.status(400).json({
      success: false,
      error: {
        code: 'TENANT_REQUIRED',
        message: 'Tenant context is required for this request',
        statusCode: 400,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'TENANT_CONTEXT_ERROR',
        message: 'Failed to resolve tenant context',
        statusCode: 500,
      },
    });
  }
};
