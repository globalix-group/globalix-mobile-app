import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { adminApi } from '../../api/adminClient';
import { ArrowLeft, Mail, Calendar, Shield, Activity } from 'lucide-react';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: Record<string, any>;
}

const UserDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      // For now, fetch from the users list and filter
      const response = await adminApi.getUsers(1000, 0);
      const userData = response.data?.data?.find((u: any) => u.id === id);
      
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
            <p className="text-gray-600 mt-1">Detailed user information and activity</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mt-4">{user.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">{user.email}</p>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={18} className="text-blue-600" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar size={18} className="text-blue-600" />
                    <span className="text-sm">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-600">Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                    Edit Profile
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition">
                    Suspend
                  </button>
                </div>
              </div>
            </div>

            {/* Activity & Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
                  <Activity size={24} className="mb-2 opacity-80" />
                  <p className="text-blue-100 text-sm">Last Active</p>
                  <p className="text-2xl font-bold mt-1">Today</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
                  <Shield size={24} className="mb-2 opacity-80" />
                  <p className="text-green-100 text-sm">Account Status</p>
                  <p className="text-2xl font-bold mt-1">Active</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">📝</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Account Created</p>
                      <p className="text-sm text-gray-600">{new Date(user.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 pb-3 border-b border-gray-200 last:border-b-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-bold">✨</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Profile Viewed 5 times</p>
                      <p className="text-sm text-gray-600">In the last 7 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">User not found</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserDetailPage;
