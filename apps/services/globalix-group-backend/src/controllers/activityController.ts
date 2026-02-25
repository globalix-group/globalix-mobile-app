import { Request, Response } from 'express';
import { ActivityLogger } from '../services/activityService';

export const ActivityController = {
  /**
   * Log an activity from mobile app
   */
  logActivity: (req: Request, res: Response) => {
    try {
      const { action, type, metadata } = req.body;
      const userId = req.userId;
      const tenantId = req.tenantId;

      if (!tenantId || !userId || !action || !type) {
        return res.status(400).json({
          error: 'action and type are required',
        });
      }

      ActivityLogger.log(tenantId, userId, action, type, metadata);

      return res.json({
        success: true,
        message: 'Activity logged',
      });
    } catch (error) {
      console.error('Activity logging error:', error);
      return res.status(500).json({ error: 'Failed to log activity' });
    }
  },

  /**
   * Get activity logs
   */
  getActivities: (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const type = req.query.type as string | undefined;

      const tenantId = req.tenantId;
      if (!tenantId) {
        return res.status(400).json({ error: 'tenantId is required' });
      }

      const result = ActivityLogger.getLogs(tenantId, limit, offset, type);

      return res.json({
        success: true,
        data: result.data,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      });
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }
  },
};
