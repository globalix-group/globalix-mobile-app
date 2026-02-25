interface ActivityLog {
  tenantId: string;
  userId: string;
  action: string;
  type: 'login' | 'signup' | 'property_view' | 'car_view' | 'inquiry' | 'purchase' | 'logout';
  metadata?: Record<string, any>;
  timestamp: Date;
}

// In-memory activity logs (in production, this would be a database)
const activityLogs: ActivityLog[] = [];

export const ActivityLogger = {
  /**
   * Log an activity
   */
  log: (tenantId: string, userId: string, action: string, type: ActivityLog['type'], metadata?: Record<string, any>) => {
    const log: ActivityLog = {
      tenantId,
      userId,
      action,
      type,
      metadata,
      timestamp: new Date(),
    };
    
    activityLogs.push(log);
    
    // Keep only last 1000 logs in memory
    if (activityLogs.length > 1000) {
      activityLogs.shift();
    }
    
    console.log(`📝 Activity logged: [${type}] ${action} by ${userId}`);
  },

  /**
   * Get activity logs with filtering
   */
  getLogs: (tenantId: string, limit = 50, offset = 0, type?: string) => {
    let filtered = activityLogs;

    filtered = filtered.filter(log => log.tenantId === tenantId);

    if (type) {
      filtered = filtered.filter(log => log.type === type);
    }

    // Sort by most recent first
    filtered = filtered.reverse();

    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);

    return {
      data,
      total,
      limit,
      offset,
    };
  },

  /**
   * Get all logs (for dashboard)
   */
  getAllLogs: (tenantId: string) => activityLogs.filter(log => log.tenantId === tenantId).reverse(),

  /**
   * Clear logs
   */
  clearLogs: () => {
    activityLogs.length = 0;
  },
};
