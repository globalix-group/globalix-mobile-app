import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';
import { useAdmin } from '../context/AdminContext';
import Link from 'next/link';

interface DashboardStats {
  users: number;
  properties: number;
  cars: number;
  inquiries: number;
  contacts: number;
  reservations: number;
  chats: number;
  activities: number;
  recentActivities: any[];
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { token } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    fetchDashboardData(true);
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => fetchDashboardData(false), 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      // Fetch data from all endpoints in parallel
      const [
        usersRes,
        propertiesRes,
        carsRes,
        inquiriesRes,
        contactsRes,
        reservationsRes,
        activitiesRes,
      ] = await Promise.all([
        adminApi.getUsers(1000, 0).catch(() => ({ data: { data: [], total: 0 } })),
        adminApi.getProperties({ limit: 1000 }).catch(() => ({ data: { data: { data: [] } } })),
        adminApi.getCars({ limit: 1000 }).catch(() => ({ data: { data: { data: [] } } })),
        adminApi.getInquiries({ limit: 1000 }).catch(() => ({ data: { data: [] } })),
        adminApi.getContacts({ limit: 1000 }).catch(() => ({ data: { data: [] } })),
        adminApi.getReservations({ limit: 1000 }).catch(() => ({ data: { data: [] } })),
        adminApi.getActivity({ limit: 10 }).catch(() => ({ data: { data: [] } })),
      ]);

      setStats({
        users: usersRes.data?.total || usersRes.data?.data?.length || 0,
        properties: propertiesRes.data?.data?.data?.length || propertiesRes.data?.data?.length || 0,
        cars: carsRes.data?.data?.data?.length || carsRes.data?.data?.length || 0,
        inquiries: inquiriesRes.data?.data?.length || 0,
        contacts: contactsRes.data?.data?.length || 0,
        reservations: reservationsRes.data?.data?.length || 0,
        chats: 3, // TODO: Replace with actual API call when backend is ready
        activities: activitiesRes.data?.data?.length || 0,
        recentActivities: activitiesRes.data?.data || [],
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Dashboard Overview
              {isRefreshing && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Updating...
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Welcome back! Real-time data • Auto-updates every 5s</p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
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

              <Link href="/chats">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">💬</span>
                    <div className="text-3xl font-bold">{stats?.chats || 0}</div>
                  </div>
                  <div className="text-cyan-100 font-medium">Chats</div>
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
