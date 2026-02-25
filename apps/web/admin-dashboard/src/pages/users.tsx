import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';
import { useAdmin } from '../context/AdminContext';
import { Search, Trash2, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status: string;
}

const UsersPage: React.FC = () => {
  const { token: _token } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ offset: 0, limit: 20 });
  const [total, setTotal] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: User | null }>({ show: false, user: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers(
        pagination.limit,
        pagination.offset,
        searchQuery || undefined
      );
      const data = response.data || {};
      if (Array.isArray(data.data)) {
        setUsers(data.data);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
      setTotal(data.total || 0);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination({ offset: 0, limit: 20 });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-800' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;

    try {
      setDeleting(true);
      await adminApi.deleteUser(deleteModal.user.id);
      setDeleteModal({ show: false, user: null });
      // Refresh users list
      await fetchUsers();
      alert('User deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all registered users</p>
        </div>

        {/* Search and Stats */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{total}</p>
                <p className="text-gray-600 text-sm">Total Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const statusBadge = getStatusBadge(user.status);
                    return (
                      <tr
                        key={user.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {user.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.id.substring(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {(user.status || 'active').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button 
                            onClick={() => setDeleteModal({ show: true, user })}
                            className="p-2 hover:bg-red-50 rounded-lg transition group"
                            title="Delete user"
                          >
                            <Trash2 size={18} className="text-gray-600 group-hover:text-red-600" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {users.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {pagination.offset + 1} to{' '}
                {Math.min(pagination.offset + pagination.limit, total)} of {total}
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
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium text-gray-700"
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
                  disabled={pagination.offset + pagination.limit >= total}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium text-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <p className="text-green-600 font-semibold text-sm">Active Users</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{users.filter(u => (u.status || 'active') === 'active').length}</p>
            <p className="text-green-700 text-xs mt-2">{total > 0 ? `${Math.round((users.filter(u => (u.status || 'active') === 'active').length / total) * 100)}% of total` : 'No users yet'}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <p className="text-yellow-600 font-semibold text-sm">Inactive Users</p>
            <p className="text-3xl font-bold text-yellow-900 mt-2">{users.filter(u => u.status === 'inactive').length}</p>
            <p className="text-yellow-700 text-xs mt-2">{total > 0 ? `${Math.round((users.filter(u => u.status === 'inactive').length / total) * 100)}% of total` : 'No inactive users'}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <p className="text-red-600 font-semibold text-sm">Suspended Users</p>
            <p className="text-3xl font-bold text-red-900 mt-2">{users.filter(u => u.status === 'suspended').length}</p>
            <p className="text-red-700 text-xs mt-2">{users.filter(u => u.status === 'suspended').length > 0 ? 'Requires admin review' : 'All users in good standing'}</p>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal.show && deleteModal.user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
                </div>
                <button
                  onClick={() => setDeleteModal({ show: false, user: null })}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  You are about to permanently delete <strong>{deleteModal.user.name}</strong> ({deleteModal.user.email}).
                  All associated data will be removed from the database.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModal({ show: false, user: null })}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UsersPage;
