import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';
import Link from 'next/link';

interface DashboardStats {
  users: number;
  properties: number;
  cars: number;
  inquiries: number;
  contacts: number;
  reservations: number;
  activities: number;
  recentActivities: any[];
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from all endpoints in parallel
      const [
        propertiesRes,
        carsRes,
        inquiriesRes,
        contactsRes,
        reservationsRes,
        activitiesRes,
      ] = await Promise.all([
        adminApi.getProperties({ limit: 1000 }).catch(() => ({ data: { data: { data: [] } } })),
        adminApi.getCars({ limit: 1000 }).catch(() => ({ data: { data: { data: [] } } })),
        adminApi.getInquiries({ limit: 1000 }).catch(() => ({ data: { data: [] } })),
        adminApi.getContacts({ limit: 1000 }).catch(() => ({ data: { data: [] } })),
        adminApi.getReservations({ limit: 1000 }).catch(() => ({ data: { data: [] } })),
        adminApi.getActivity({ limit: 10 }).catch(() => ({ data: { data: [] } })),
      ]);

      setStats({
        users: 0, // Will be populated by admin backend
        properties: propertiesRes.data?.data?.data?.length || propertiesRes.data?.data?.length || 0,
        cars: carsRes.data?.data?.data?.length || carsRes.data?.data?.length || 0,
        inquiries: inquiriesRes.data?.data?.length || 0,
        contacts: contactsRes.data?.data?.length || 0,
        reservations: reservationsRes.data?.data?.length || 0,
        activities: activitiesRes.data?.data?.length || 0,
        recentActivities: activitiesRes.data?.data || [],
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with Globalix.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/properties">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">🏠</span>
                    <div className="text-3xl font-bold">{stats?.properties || 0}</div>
                  </div>
                  <div className="text-blue-100 font-medium">Properties</div>
                </div>
              </Link>

              <Link href="/cars">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">🚗</span>
                    <div className="text-3xl font-bold">{stats?.cars || 0}</div>
                  </div>
                  <div className="text-green-100 font-medium">Cars</div>
                </div>
              </Link>

              <Link href="/inquiries">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">📧</span>
                    <div className="text-3xl font-bold">{stats?.inquiries || 0}</div>
                  </div>
                  <div className="text-purple-100 font-medium">Inquiries</div>
                </div>
              </Link>

              <Link href="/contacts">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">💬</span>
                    <div className="text-3xl font-bold">{stats?.contacts || 0}</div>
                  </div>
                  <div className="text-orange-100 font-medium">Contacts</div>
                </div>
              </Link>

              <Link href="/reservations">
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">📅</span>
                    <div className="text-3xl font-bold">{stats?.reservations || 0}</div>
                  </div>
                  <div className="text-pink-100 font-medium">Reservations</div>
                </div>
              </Link>

              <Link href="/users">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">👥</span>
                    <div className="text-3xl font-bold">{stats?.users || 0}</div>
                  </div>
                  <div className="text-indigo-100 font-medium">Users</div>
                </div>
              </Link>

              <Link href="/activity">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">📝</span>
                    <div className="text-3xl font-bold">{stats?.activities || 0}</div>
                  </div>
                  <div className="text-teal-100 font-medium">Activities</div>
                </div>
              </Link>

              <Link href="/analytics">
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">📈</span>
                    <div className="text-3xl font-bold">View</div>
                  </div>
                  <div className="text-red-100 font-medium">Analytics</div>
                </div>
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <Link
                  href="/activity"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>

              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivities.slice(0, 5).map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {activity.type === 'login'
                            ? '🔐'
                            : activity.type === 'signup'
                            ? '✨'
                            : '📝'}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          activity.type === 'login'
                            ? 'bg-blue-100 text-blue-800'
                            : activity.type === 'signup'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {activity.type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/properties">
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    🏠 Manage Properties
                  </h3>
                  <p className="text-sm text-gray-600">
                    View and manage all property listings
                  </p>
                </div>
              </Link>

              <Link href="/cars">
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    🚗 Manage Cars
                  </h3>
                  <p className="text-sm text-gray-600">
                    View and manage car inventory
                  </p>
                </div>
              </Link>

              <Link href="/inquiries">
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    📧 Review Inquiries
                  </h3>
                  <p className="text-sm text-gray-600">
                    Check and respond to customer inquiries
                  </p>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
            trend={12}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={stats?.activeUsers || 0}
            icon={<TrendingUp size={32} />}
            trend={8}
            color="green"
          />
          <StatCard
            title="Total Earnings"
            value={`$${(stats?.totalEarnings || 0).toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}`}
            icon={<DollarSign size={32} />}
            trend={15}
            color="purple"
          />
          <StatCard
            title="Inquiries"
            value={stats?.totalInquiries || 0}
            icon={<MessageSquare size={32} />}
            trend={5}
            color="orange"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Signups Today</span>
                <span className="text-2xl font-bold text-green-600">{stats?.newSignups || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Logins</span>
                <span className="text-2xl font-bold text-blue-600">{stats?.totalLogins || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="text-2xl font-bold text-purple-600">4.2%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {recentActivity.slice(0, 4).map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded"
                >
                  <span className="text-gray-700">{activity.action}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow p-8">
          <h3 className="text-2xl font-bold mb-2">Manage Your Platform</h3>
          <p className="text-blue-100 mb-6">
            Monitor activities, view analytics, manage users, and track earnings all in one place.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="/activity"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition"
            >
              View All Activities
            </a>
            <a
              href="/earnings"
              className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Check Earnings
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
