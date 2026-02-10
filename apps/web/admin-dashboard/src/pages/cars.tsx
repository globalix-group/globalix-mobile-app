import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { adminApi } from '../api/adminClient';

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  pricePerDay: number;
  specs: string;
  images: string[];
  features: string[];
  category: string;
  availability: boolean;
  createdAt: string;
}

const CarsPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getCars({ limit: 100 });
      if (response.data.success && response.data.data) {
        setCars(response.data.data.data || response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesCategory = !categoryFilter || car.category === categoryFilter;
    const matchesAvailability =
      !availabilityFilter ||
      (availabilityFilter === 'available' && car.availability) ||
      (availabilityFilter === 'unavailable' && !car.availability);
    const matchesSearch =
      !searchTerm ||
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesAvailability && matchesSearch;
  });

  const stats = {
    total: cars.length,
    available: cars.filter((c) => c.availability).length,
    unavailable: cars.filter((c) => !c.availability).length,
    avgPrice: cars.length > 0
      ? Math.round(cars.reduce((sum, c) => sum + Number(c.price), 0) / cars.length)
      : 0,
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header with Stats */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cars Management</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Cars</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Available</div>
              <div className="text-3xl font-bold text-green-600">{stats.available}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Rented</div>
              <div className="text-3xl font-bold text-red-600">{stats.unavailable}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Avg Price</div>
              <div className="text-3xl font-bold text-blue-600">
                ${stats.avgPrice.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="🔍 Search cars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="Luxury">Luxury</option>
              <option value="Sports">Sports</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
            </select>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Availability</option>
              <option value="available">Available</option>
              <option value="unavailable">Rented</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
            <button onClick={fetchCars} className="ml-4 underline">
              Retry
            </button>
          </div>
        )}

        {/* Cars Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading cars...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No cars found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 relative">
                  {car.images && car.images.length > 0 ? (
                    <img
                      src={car.images[0]}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      🚗
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        car.availability
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {car.availability ? 'Available' : 'Rented'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">
                      {car.name}
                    </h3>
                    {car.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {car.category}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {car.brand} {car.model} • {car.year}
                  </p>

                  <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {car.specs}
                  </div>

                  {car.features && car.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {car.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {car.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{car.features.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold text-blue-600">
                          ${Number(car.price).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${Number(car.pricePerDay).toLocaleString()}/day
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        Added {new Date(car.createdAt).toLocaleDateString()}
                      </div>
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

export default CarsPage;
