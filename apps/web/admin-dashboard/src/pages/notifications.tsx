import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';
import { Bell, Search, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
    // Refresh every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await adminApi.getActivity({ limit: 100 });
      if (response.data?.data) {
        // Transform activities into notifications format
        const transformed = response.data.data.map((activity: any) => ({
          id: activity.id,
          userId: activity.userId,
          type: activity.type,
          title: activity.action,
          message: JSON.stringify(activity.metadata),
          isRead: false,
          createdAt: activity.timestamp,
        }));
        setNotifications(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      login: '🔐',
      signup: '✨',
      property_view: '🏠',
      car_view: '🚗',
      inquiry: '📝',
      contact: '💬',
      reservation: '📅',
      payment: '💳',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      login: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
      signup: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
      property_view: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
      car_view: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
      inquiry: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
      warning: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
      error: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
    };
    return colors[type] || { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' };
  };

  const filteredNotifications = notifications
    .filter((n) => {
      if (filter === 'unread') return !n.isRead;
      if (filter === 'read') return n.isRead;
      return true;
    })
    .filter((n) => !typeFilter || n.type === typeFilter)
    .filter((n) => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Bell size={32} /> System Notifications
            </h1>
            <p className="text-gray-600 mt-1">Real-time system activity and user notifications</p>
          </div>
          {unreadCount > 0 && (
            <div className="text-right">
              <p className="text-4xl font-bold text-blue-600">{unreadCount}</p>
              <p className="text-gray-600 text-sm">Unread</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Types</option>
              <option value="login">Login</option>
              <option value="signup">Signup</option>
              <option value="property_view">Property View</option>
              <option value="car_view">Car View</option>
              <option value="inquiry">Inquiry</option>
            </select>

            {/* Read Status Filter */}
            <div className="flex gap-2">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'unread' ? `Unread (${unreadCount})` : 'Read'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Bell size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const colors = getNotificationColor(notification.type);
              const icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`${colors.bg} border ${colors.border} rounded-lg p-4 flex items-start justify-between hover:shadow-md transition`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl mt-1">{icon}</div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${colors.text}`}>{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {!notification.isRead && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                      <Trash2 size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        {filteredNotifications.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-blue-600 font-semibold text-sm">Total Notifications</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">{notifications.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-600 font-semibold text-sm">Read</p>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {notifications.filter((n) => n.isRead).length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-yellow-600 font-semibold text-sm">Unread</p>
              <p className="text-2xl font-bold text-yellow-900 mt-2">{unreadCount}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-purple-600 font-semibold text-sm">Today</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {notifications.filter((n) => {
                  const today = new Date();
                  const notifDate = new Date(n.createdAt);
                  return (
                    notifDate.toDateString() === today.toDateString()
                  );
                }).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
