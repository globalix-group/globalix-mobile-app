import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';
import { useAdmin } from '../context/AdminContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ChartData {
  date: string;
  users: number;
  earnings: number;
  inquiries: number;
  logins: number;
}

const AnalyticsPage: React.FC = () => {
  const { token: _token } = useAdmin();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [days, setDays] = useState(30);
  const [_stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics(true); // Initial load with loading state
    // Auto-refresh every 5 seconds without loading state
    const interval = setInterval(() => fetchAnalytics(false), 5000);
    return () => clearInterval(interval);
  }, [days]);

  const fetchAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      // Fetch real data from backend
      const [usersRes, activitiesRes, reservationsRes] = await Promise.all([
        adminApi.getUsers(1000, 0).catch(() => ({ data: { data: [], total: 0 } })),
        adminApi.getActivity({ limit: 1000 }).catch(() => ({ data: { data: [] } })),
        adminApi.getReservations({ limit: 1000 }).catch(() => ({ data: { data: [] } })),
      ]);

      const users = usersRes.data?.data || [];
      const activities = activitiesRes.data?.data || [];
      const reservations = reservationsRes.data?.data || [];

      // Process data by date
      const dateMap = new Map<string, any>();
      const today = new Date();
      
      // Initialize dates
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dateMap.set(dateKey, {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: 0,
          earnings: 0,
          inquiries: 0,
          logins: 0,
        });
      }

      // Count users by creation date
      users.forEach((user: any) => {
        const dateKey = new Date(user.createdAt).toISOString().split('T')[0];
        if (dateMap.has(dateKey)) {
          const data = dateMap.get(dateKey);
          data.users += 1;
        }
      });

      // Count activities
      activities.forEach((activity: any) => {
        const dateKey = new Date(activity.timestamp || activity.createdAt).toISOString().split('T')[0];
        if (dateMap.has(dateKey)) {
          const data = dateMap.get(dateKey);
          if (activity.type === 'login') {
            data.logins += 1;
          } else if (activity.type === 'inquiry' || activity.type.includes('inquiry')) {
            data.inquiries += 1;
          }
        }
      });

      // Calculate earnings from reservations
      reservations.forEach((reservation: any) => {
        if (reservation.status === 'Completed') {
          const dateKey = new Date(reservation.createdAt).toISOString().split('T')[0];
          if (dateMap.has(dateKey)) {
            const data = dateMap.get(dateKey);
            data.earnings += Number(reservation.totalPrice) || 0;
          }
        }
      });

      const chartDataArray = Array.from(dateMap.values());
      setChartData(chartDataArray);

      // Calculate real stats
      const completedReservations = reservations.filter((r: any) => r.status === 'Completed');
      const totalEarnings = completedReservations.reduce((sum: number, r: any) => sum + (Number(r.totalPrice) || 0), 0);
      
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newUsersThisMonth = users.filter((u: any) => new Date(u.createdAt) >= firstOfMonth).length;
      
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => (u.status || 'active') === 'active').length,
        newUsersThisMonth,
        totalEarnings,
        totalActivities: activities.length,
        totalReservations: reservations.length,
        completedReservations: completedReservations.length,
      });
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      if (chartData.length === 0) {
        setChartData([]);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              Analytics
              {isRefreshing && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Refreshing...
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Real-time platform performance • Auto-updates every 5s</p>
          </div>
          <div className="flex gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  days === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Users & Logins Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              Users & Login Activity
            </h3>
            {loading ? (
              <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="New Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="logins"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Logins"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Earnings Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-600" />
              Revenue Trends
            </h3>
            {loading ? (
              <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${(value as number).toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="earnings" fill="#10b981" name="Earnings ($)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Inquiries Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-orange-600" />
              User Inquiries
            </h3>
            {loading ? (
              <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inquiries" fill="#f59e0b" name="Inquiries" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {chartData.length > 0 && (
              <>
                <div className="bg-blue-50 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium">Total Users This Period</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {chartData.reduce((sum, d) => sum + d.users, 0)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    ${chartData.reduce((sum, d) => sum + d.earnings, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium">Total Inquiries</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {chartData.reduce((sum, d) => sum + d.inquiries, 0)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium">Total Logins</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {chartData.reduce((sum, d) => sum + d.logins, 0)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
