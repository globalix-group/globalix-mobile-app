import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';

interface CarReservation {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  car?: { name: string; brand: string; model: string };
}

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<CarReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getReservations({ limit: 100 });
      if (response.data.success && response.data.data) {
        setReservations(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      setUpdating(id);
      await adminApi.updateReservation(id, { status });
      setReservations(
        reservations.map((res) => (res.id === id ? { ...res, status } : res))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update reservation');
    } finally {
      setUpdating(null);
    }
  };

  const filteredReservations = reservations.filter(
    (reservation) => !statusFilter || reservation.status === statusFilter
  );

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'Pending').length,
    confirmed: reservations.filter((r) => r.status === 'Confirmed').length,
    completed: reservations.filter((r) => r.status === 'Completed').length,
    cancelled: reservations.filter((r) => r.status === 'Cancelled').length,
  };

  const totalRevenue = reservations
    .filter((r) => r.status === 'Completed')
    .reduce((sum, r) => sum + Number(r.totalPrice), 0);

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Car Reservations
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Confirmed</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.confirmed}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.completed}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Revenue</div>
              <div className="text-2xl font-bold text-purple-600">
                ${totalRevenue.toLocaleString()}
              </div>
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
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
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
            <p className="mt-4 text-gray-600">Loading reservations...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No reservations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {reservation.car?.name || 'Car'} - {reservation.car?.brand}{' '}
                        {reservation.car?.model}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          reservation.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : reservation.status === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : reservation.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Customer:</span>{' '}
                      {reservation.user?.name || 'N/A'} (
                      {reservation.user?.email || 'N/A'})
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${Number(reservation.totalPrice).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1">Start Date</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(reservation.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1">End Date</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(reservation.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1">Duration</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {Math.ceil(
                        (new Date(reservation.endDate).getTime() -
                          new Date(reservation.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Booked on {new Date(reservation.createdAt).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    {reservation.status === 'Pending' && (
                      <>
                        <button
                          onClick={() =>
                            updateReservationStatus(reservation.id, 'Confirmed')
                          }
                          disabled={updating === reservation.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() =>
                            updateReservationStatus(reservation.id, 'Cancelled')
                          }
                          disabled={updating === reservation.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {reservation.status === 'Confirmed' && (
                      <button
                        onClick={() =>
                          updateReservationStatus(reservation.id, 'Completed')
                        }
                        disabled={updating === reservation.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                      >
                        Complete
                      </button>
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

export default ReservationsPage;
