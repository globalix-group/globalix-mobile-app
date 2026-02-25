import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billingService';
import { AppError } from '../middleware/errorHandler';

export class BillingController {
  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { planId, interval } = req.body;
      if (!planId) {
        throw new AppError(400, 'PLAN_REQUIRED', 'Plan ID is required');
      }

      const result = await BillingService.createCheckoutSession(
        tenantId,
        planId,
        interval === 'annual' ? 'annual' : 'monthly'
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async webhook(req: Request, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string | undefined;
      const rawBody = req.body as Buffer;
      const result = await BillingService.handleStripeWebhook(rawBody, signature);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 400).json({
        success: false,
        error: error.message || 'Stripe webhook error',
      });
    }
  }

  static async bootstrapPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      await BillingService.ensureDefaultPlans();
      res.json({ success: true, message: 'Default plans ensured' });
    } catch (error) {
      next(error);
    }
  }
}
