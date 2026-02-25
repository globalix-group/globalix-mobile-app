import { Request, Response, NextFunction } from 'express';
import { Plan, Subscription, Property, Car } from '../models';

export const enforceListingLimits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'TENANT_REQUIRED', message: 'Tenant context is required' },
      });
    }

    const subscription = await Subscription.findOne({ where: { tenantId } });
    if (!subscription || !['trialing', 'active'].includes(subscription.status)) {
      return res.status(402).json({
        success: false,
        error: { code: 'SUBSCRIPTION_REQUIRED', message: 'Active subscription required' },
      });
    }

    const plan = subscription.planId ? await Plan.findByPk(subscription.planId) : null;
    if (!plan || !plan.limits) {
      return next();
    }

    const maxListings = Number(plan.limits?.maxListings || 0);
    if (!maxListings) {
      return next();
    }

    const [propertyCount, carCount] = await Promise.all([
      Property.count({ where: { tenantId } }),
      Car.count({ where: { tenantId } }),
    ]);

    if (propertyCount + carCount >= maxListings) {
      return res.status(403).json({
        success: false,
        error: { code: 'PLAN_LIMIT_REACHED', message: 'Listing limit reached for this plan' },
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'PLAN_CHECK_FAILED', message: 'Failed to enforce plan limits' },
    });
  }
};
