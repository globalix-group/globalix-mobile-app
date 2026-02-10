import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';

interface Inquiry {
  id: string;
  userId: string;
  propertyId: string;
  message: string;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  property?: { title: string; location: string };
}

const InquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getInquiries({ limit: 100 });
      if (response.data.success && response.data.data) {
        setInquiries(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    try {
      setUpdating(id);
      await adminApi.updateInquiry(id, { status });
      setInquiries(
        inquiries.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update inquiry');
    } finally {
      setUpdating(null);
    }
  };

  const filteredInquiries = inquiries.filter(
    (inquiry) => !statusFilter || inquiry.status === statusFilter
  );

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === 'Pending').length,
    contacted: inquiries.filter((i) => i.status === 'Contacted').length,
    closed: inquiries.filter((i) => i.status === 'Closed').length,
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Property Inquiries
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Inquiries</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Contacted</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.contacted}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Closed</div>
              <div className="text-3xl font-bold text-gray-600">{stats.closed}</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="Viewed">Viewed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading inquiries...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No inquiries found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {inquiry.property?.title || 'Property'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          inquiry.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : inquiry.status === 'Contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : inquiry.status === 'Viewed'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      📍 {inquiry.property?.location || 'N/A'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                    <br />
                    {new Date(inquiry.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {inquiry.message}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">From:</span>{' '}
                    {inquiry.user?.name || 'User'} ({inquiry.user?.email || 'N/A'})
                  </div>
                  <div className="flex gap-2">
                    {inquiry.status !== 'Closed' && (
                      <>
                        {inquiry.status === 'Pending' && (
                          <button
                            onClick={() =>
                              updateInquiryStatus(inquiry.id, 'Contacted')
                            }
                            disabled={updating === inquiry.id}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                          >
                            Mark Contacted
                          </button>
                        )}
                        {inquiry.status === 'Contacted' && (
                          <button
                            onClick={() =>
                              updateInquiryStatus(inquiry.id, 'Viewed')
                            }
                            disabled={updating === inquiry.id}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                          >
                            Mark Viewed
                          </button>
                        )}
                        <button
                          onClick={() => updateInquiryStatus(inquiry.id, 'Closed')}
                          disabled={updating === inquiry.id}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InquiriesPage;
