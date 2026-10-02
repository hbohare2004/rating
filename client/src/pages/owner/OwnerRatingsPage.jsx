import { useState, useEffect, useCallback } from 'react';
import { storeOwnerService } from '../../services/endpoints';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateDisplays';
import StarRating from '../../components/StarRating';
import { Search, Star, Store, Filter } from 'lucide-react';

export default function OwnerRatingsPage() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState('');

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await storeOwnerService.getRatings();
      setRatings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch store ratings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const filteredRatings = ratings.filter((r) => {
    const matchesSearch =
      !search ||
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.store?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStar = !starFilter || r.rating === Number(starFilter);

    return matchesSearch && matchesStar;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">All Ratings & Reviews</h1>
        <p className="text-sm text-gray-500 mt-0.5">Comprehensive view of all customer feedback across your managed stores</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or store..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={starFilter}
            onChange={(e) => setStarFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Stars (1 - 5)</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState message="Loading ratings..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRatings} />
        ) : filteredRatings.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No ratings found"
            description={search || starFilter ? 'Try adjusting your search or star filter.' : 'No customer ratings have been submitted yet.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Store</th>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Rating</th>
                  <th className="px-6 py-3.5 text-right">Submitted On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRatings.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {r.store?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                      {r.user?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {r.user?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.rating} size={15} />
                        <span className="font-bold text-gray-900 text-xs">{r.rating}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-right text-xs whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
