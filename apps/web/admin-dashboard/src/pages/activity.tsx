import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';
import { useAdmin } from '../context/AdminContext';
import { Filter, Search, RefreshCw, Activity as ActivityIcon, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  userId: string;
  type: string;
  action: string;
  timestamp: string;
  metadata: Record<string, any>;
}

const ActivityPage: React.FC = () => {
  const { token } = useAdmin();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ offset: 0, limit: 50 });
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchActivities();
    
    // Auto-refresh activities every 2 seconds if enabled
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchActivities, 2000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [typeFilter, pagination, autoRefresh]);

  const fetchActivities = async () => {
    try {
      setError(null);
      const response = await adminApi.getActivity(
        pagination.limit,
        pagination.offset,
        typeFilter || undefined
      );
      
      if (response.data) {
        // Handle different response formats
        if (response.data.success === true && Array.isArray(response.data.data)) {
          setActivities(response.data.data);
        } else if (Array.isArray(response.data.data)) {
          setActivities(response.data.data);
        } else if (Array.isArray(response.data)) {
          setActivities(response.data);
        } else {
          setActivities([]);
        }
      } else {
        setActivities([]);
      }
      
      setLastFetch(new Date());
    } catch (error: any) {
      console.error('Failed to fetch activities:', error);
      setError(error?.response?.data?.error || error?.message || 'Failed to fetch activities');
      // Don't clear activities on error, keep showing last known state
    } finally {
      setLoading(false);
    }
  };

  const getActivityBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; icon: string }> = {
      login: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🔐' },
      signup: { bg: 'bg-green-100', text: 'text-green-800', icon: '✨' },
      property_view: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🏠' },
      car_view: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🚗' },
      inquiry: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '💬' },
      purchase: { bg: 'bg-pink-100', text: 'text-pink-800', icon: '💰' },
    };
    const badge = badges[type] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📝' };
    return badge;
  };

  const filteredActivities = activities.filter((activity) =>
    activity.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleString();
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <ActivityIcon size={32} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
            </div>
            <p className="text-gray-600 mt-1">Real-time monitoring of all user activities</p>
            {lastFetch && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {formatTimestamp(lastFetch.toISOString())}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            
            <button
              onClick={fetchActivities}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Error fetching activities</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchActivities}
                className="text-sm text-red-700 underline mt-2 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
            <div className="text-3xl font-bold">{filteredActivities.length}</div>
            <div className="text-blue-100 text-sm mt-1">Total Activities</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
            <div className="text-3xl font-bold">
              {filteredActivities.filter(a => a.type === 'signup').length}
            </div>
            <div className="text-green-100 text-sm mt-1">Sign-ups</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
            <div className="text-3xl font-bold">
              {filteredActivities.filter(a => a.type === 'login').length}
            </div>
            <div className="text-purple-100 text-sm mt-1">Logins</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
            <div className="text-3xl font-bold">
              {autoRefresh ? '🟢' : '⏸️'}
            </div>
            <div className="text-orange-100 text-sm mt-1">Live Status</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative col-span-1 md:col-span-2">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All Types</option>
                <option value="login">Login</option>
                <option value="signup">Sign-up</option>
                <option value="property_view">Property View</option>
                <option value="car_view">Car View</option>
                <option value="inquiry">Inquiry</option>
                <option value="purchase">Purchase</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activities Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && activities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                      Loading activities...
                    </td>
                  </tr>
                ) : filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <ActivityIcon className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="font-medium">No activities found</p>
                      <p className="text-sm mt-1">Activities will appear here in real-time when users interact with the app</p>
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => {
                    const badge = getActivityBadge(activity.type);
                    return (
                      <tr
                        key={activity.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {activity.userId.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
                          >
                            <span>{badge.icon}</span>
                            {activity.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{activity.action}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatTimestamp(activity.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {activity.metadata?.email && (
                            <span className="bg-gray-100 px-2 py-1 rounded">{activity.metadata.email}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredActivities.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-semibold">
                  {Math.min(pagination.offset + 1, filteredActivities.length)}
                </span>{' '}
                to{' '}
                <span className="font-semibold">
                  {Math.min(pagination.offset + pagination.limit, filteredActivities.length)}
                </span>{' '}
                of <span className="font-semibold">{filteredActivities.length}</span> activities
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ActivityPage;
