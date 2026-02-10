import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  images: string[];
  type: string;
  status: string;
  createdAt: string;
}

const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getProperties({ limit: 100 });
      if (response.data.success && response.data.data) {
        setProperties(response.data.data.data || response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesType = !typeFilter || property.type === typeFilter;
    const matchesStatus = !statusFilter || property.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const stats = {
    total: properties.length,
    available: properties.filter((p) => p.status === 'Available').length,
    sold: properties.filter((p) => p.status === 'Sold').length,
    rented: properties.filter((p) => p.status === 'Rented').length,
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header with Stats */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Properties Management</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Properties</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Available</div>
              <div className="text-3xl font-bold text-green-600">{stats.available}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Sold</div>
              <div className="text-3xl font-bold text-blue-600">{stats.sold}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Rented</div>
              <div className="text-3xl font-bold text-purple-600">{stats.rented}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="🔍 Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Penthouses">Penthouses</option>
              <option value="Villas">Villas</option>
              <option value="Estates">Estates</option>
              <option value="Commercial">Commercial</option>
              <option value="Condos">Condos</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
            <button onClick={fetchProperties} className="ml-4 underline">
              Retry
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No properties found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 relative">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      🏠
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        property.status === 'Available'
                          ? 'bg-green-100 text-green-800'
                          : property.status === 'Sold'
                          ? 'bg-blue-100 text-blue-800'
                          : property.status === 'Rented'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">
                      {property.title}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {property.type}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span>📍 {property.location}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>🛏️ {property.beds} beds</span>
                    <span>🚿 {property.baths} baths</span>
                    <span>📐 {property.sqft} sqft</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">
                      ${Number(property.price).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Listed {new Date(property.createdAt).toLocaleDateString()}
                    </div>
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

export default PropertiesPage;
