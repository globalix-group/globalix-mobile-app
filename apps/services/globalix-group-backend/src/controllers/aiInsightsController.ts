import { Request, Response, NextFunction } from 'express';
import { AiInsightsService } from '../services/aiInsightsService';
import { AppError } from '../middleware/errorHandler';

export class AiInsightsController {
  static async requestInsight(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { entityType, entityId, context } = req.body;
      if (!entityType || !entityId) {
        throw new AppError(400, 'INVALID_REQUEST', 'entityType and entityId are required');
      }

      const insight = await AiInsightsService.requestInsight(tenantId, entityType, entityId, context);
      res.status(202).json({ success: true, data: insight });
    } catch (error) {
      next(error);
    }
  }

  static async listInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) {
        throw new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required');
      }

      const { entityType, entityId } = req.query;
      const insights = await AiInsightsService.listInsights(
        tenantId,
        entityType as string | undefined,
        entityId as string | undefined
      );

      res.json({ success: true, data: insights });
    } catch (error) {
      next(error);
    }
  }
}
