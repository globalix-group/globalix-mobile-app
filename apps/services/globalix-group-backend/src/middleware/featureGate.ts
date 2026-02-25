import { Request, Response, NextFunction } from 'express';
import { FeatureFlag } from '../models';

export const requireFeature = (featureKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          error: { code: 'TENANT_REQUIRED', message: 'Tenant context is required' },
        });
      }

      if (process.env.FEATURE_FLAGS_DEFAULT === 'enabled') {
        return next();
      }

      const flag = await FeatureFlag.findOne({ where: { tenantId, key: featureKey } });
      if (!flag || !flag.enabled) {
        return res.status(403).json({
          success: false,
          error: { code: 'FEATURE_DISABLED', message: 'Feature not enabled for this tenant' },
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: 'FEATURE_CHECK_FAILED', message: 'Failed to verify feature flag' },
      });
    }
  };
};
