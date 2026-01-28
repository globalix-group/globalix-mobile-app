import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { StatCard, StatCardSkeleton } from '../components/StatCard';
import { adminApi } from '../api/adminClient';
import { useAdmin } from '../context/AdminContext';
import { Users, TrendingUp, DollarSign, MessageSquare } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalEarnings: number;
  totalInquiries: number;
  newSignups: number;
  totalLogins: number;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { token } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashResponse, activityResponse] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getActivity(5, 0),
      ]);

      if (dashResponse.data && dashResponse.data.stats) {
        setStats(dashResponse.data.stats);
      } else {
        setStats(dashResponse.data || {});
      }
      
      if (activityResponse.data && Array.isArray(activityResponse.data.data)) {
        setRecentActivity(activityResponse.data.data);
      } else if (Array.isArray(activityResponse.data)) {
        setRecentActivity(activityResponse.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalEarnings: 0,
        totalInquiries: 0,
        newSignups: 0,
        totalLogins: 0,
      } as DashboardStats);
    } finally {
      setLoading(false);
    }
  };

  if (!stats && loading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your app overview.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<Users size={32} />}
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
