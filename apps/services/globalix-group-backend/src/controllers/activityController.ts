import { Request, Response } from 'express';
import { ActivityLogger } from '../services/activityService';

export const ActivityController = {
  /**
   * Log an activity from mobile app
   */
  logActivity: (req: Request, res: Response) => {
    try {
      const { userId, action, type, metadata } = req.body;

      if (!userId || !action || !type) {
        return res.status(400).json({
          error: 'userId, action, and type are required',
        });
      }

      ActivityLogger.log(userId, action, type, metadata);

      res.json({
        success: true,
        message: 'Activity logged',
      });
    } catch (error) {
      console.error('Activity logging error:', error);
      res.status(500).json({ error: 'Failed to log activity' });
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

      const result = ActivityLogger.getLogs(limit, offset, type);

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      });
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  },
};
