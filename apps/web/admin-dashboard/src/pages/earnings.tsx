import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';
import { useAdmin } from '../context/AdminContext';
import { DollarSign, TrendingUp, Download } from 'lucide-react';

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  timestamp: string;
}

const EarningsPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAdmin();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    completedEarnings: 0,
    pendingEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getEarnings(period);
      const data = response.data || {};
      setEarnings({
        totalEarnings: data.totalEarnings || 0,
        completedEarnings: data.completedEarnings || 0,
        pendingEarnings: data.pendingEarnings || 0,
      });
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch earnings:', error);
      setEarnings({
        totalEarnings: 0,
        completedEarnings: 0,
        pendingEarnings: 0,
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      completed: { bg: 'bg-green-100', text: 'text-green-800' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      failed: { bg: 'bg-red-100', text: 'text-red-800' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      property_sale: 'Property Sale',
      car_rental: 'Car Rental',
      commission: 'Commission',
      refund: 'Refund',
      payout: 'Payout',
    };
    return labels[type] || type;
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Earnings & Transactions</h1>
            <p className="text-gray-600 mt-1">Track all revenue and payments</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            <Download size={20} />
            Export Report
          </button>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'All Time', value: 'all' },
            { label: 'Today', value: 'today' },
            { label: 'This Week', value: 'week' },
            { label: 'This Month', value: 'month' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                period === p.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Earnings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1">TOTAL EARNINGS</p>
                <p className="text-4xl font-bold text-blue-900">
                  ${earnings.totalEarnings.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="text-blue-600" size={40} />
            </div>
          </div>

          {/* Completed */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold mb-1">COMPLETED</p>
                <p className="text-4xl font-bold text-green-900">
                  ${earnings.completedEarnings.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="text-green-600" size={40} />
            </div>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-semibold mb-1">PENDING</p>
                <p className="text-4xl font-bold text-yellow-900">
                  ${earnings.pendingEarnings.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="text-yellow-600" size={40} />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => {
                    const statusBadge = getStatusBadge(txn.status);
                    return (
                      <tr
                        key={txn.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                          {txn.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {getTypeLabel(txn.type)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          ${txn.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {txn.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(txn.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Property Sales</span>
                <span className="text-lg font-bold text-gray-900">$85,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Car Rentals</span>
                <span className="text-lg font-bold text-gray-900">$35,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Commissions</span>
                <span className="text-lg font-bold text-gray-900">$5,400</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EarningsPage;
