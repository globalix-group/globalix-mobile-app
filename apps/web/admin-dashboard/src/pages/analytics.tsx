import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const { token } = useAdmin();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAnalytics(days);
      if (response.data && Array.isArray(response.data.data)) {
        setChartData(response.data.data);
      } else if (Array.isArray(response.data)) {
        setChartData(response.data);
      } else {
        setChartData([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
            <p className="text-gray-600 mt-1">View platform performance and trends</p>
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
