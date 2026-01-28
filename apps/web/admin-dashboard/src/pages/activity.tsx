import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';
import { useAdmin } from '../context/AdminContext';
import { Filter, Search } from 'lucide-react';

interface Activity {
  id: string;
  userId: string;
  type: string;
  action: string;
  timestamp: string;
  metadata: Record<string, any>;
}

const ActivityPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAdmin();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ offset: 0, limit: 20 });

  useEffect(() => {
    fetchActivities();
    // Auto-refresh activities every 3 seconds
    const interval = setInterval(fetchActivities, 3000);
    return () => clearInterval(interval);
  }, [typeFilter, pagination]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getActivity(
        pagination.limit,
        pagination.offset,
        typeFilter || undefined
      );
      
      if (response.data && Array.isArray(response.data.data)) {
        setActivities(response.data.data);
      } else if (Array.isArray(response.data)) {
        setActivities(response.data);
      } else {
        setActivities([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      login: { bg: 'bg-blue-100', text: 'text-blue-800' },
      signup: { bg: 'bg-green-100', text: 'text-green-800' },
      property_view: { bg: 'bg-purple-100', text: 'text-purple-800' },
      car_view: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      inquiry: { bg: 'bg-orange-100', text: 'text-orange-800' },
      purchase: { bg: 'bg-pink-100', text: 'text-pink-800' },
    };
    const badge = badges[type] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return badge;
  };

  const filteredActivities = activities.filter((activity) =>
    activity.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
          <p className="text-gray-600 mt-1">Monitor all user activities in real-time</p>
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
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPagination({ offset: 0, limit: 20 });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All Types</option>
                <option value="login">Login</option>
                <option value="signup">Signup</option>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      Loading activities...
                    </td>
                  </tr>
                ) : filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      No activities found
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => {
                    const badge = getActivityBadge(activity.type);
                    return (
                      <tr
                        key={activity.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">
                          {activity.userId}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
                          >
                            {activity.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{activity.action}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredActivities.length > 0 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {pagination.offset + 1} to{' '}
                {Math.min(
                  pagination.offset + pagination.limit,
                  filteredActivities.length
                )}{' '}
                of {filteredActivities.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      offset: Math.max(0, pagination.offset - pagination.limit),
                    })
                  }
                  disabled={pagination.offset === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium text-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      offset: pagination.offset + pagination.limit,
                    })
                  }
                  disabled={pagination.offset + pagination.limit >= filteredActivities.length}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium text-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ActivityPage;
