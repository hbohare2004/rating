import { useState, useEffect, useCallback } from 'react';
import { storeService } from '../../services/endpoints';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateDisplays';
import StarRating from '../../components/StarRating';
import RatingModal from './RatingModal';
import { Search, Store, Star, MapPin, Edit3, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [activeStoreForRating, setActiveStoreForRating] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await storeService.getStores({
        search: search.trim() || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });
      setStores(res.data.data.stores);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stores.');
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Explore Stores</h1>
        <p className="text-sm text-gray-500 mt-0.5">Discover registered stores, view overall ratings, and share your feedback</p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search stores by name or address..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <LoadingState message="Loading available stores..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStores} />
      ) : stores.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No stores found"
          description={search ? 'No stores match your search query.' : 'There are no registered stores yet.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store) => {
            const hasUserRating = Boolean(store.userRating);

            return (
              <div
                key={store.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between hover:border-gray-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-1">
                      {store.name}
                    </h3>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{store.address}</span>
                  </div>

                  {/* Rating stats */}
                  <div className="p-3 bg-gray-50 rounded-lg space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Overall Rating</span>
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={Math.round(store.averageRating)} size={14} />
                        <span className="font-bold text-gray-900">
                          {store.averageRating > 0 ? store.averageRating.toFixed(1) : '—'}
                        </span>
                        <span className="text-gray-400">({store.totalRatings})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60">
                      <span className="text-gray-500 font-medium">Your Rating</span>
                      {hasUserRating ? (
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={store.userRating.rating} size={14} />
                          <span className="font-bold text-primary-600">{store.userRating.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not rated yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating Action Button */}
                <div>
                  {hasUserRating ? (
                    <button
                      onClick={() => setActiveStoreForRating({ store, existingRating: store.userRating })}
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Modify Your Rating
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveStoreForRating({ store, existingRating: null })}
                      className="w-full py-2 px-3 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Submit Rating
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} stores
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {activeStoreForRating && (
        <RatingModal
          store={activeStoreForRating.store}
          existingRating={activeStoreForRating.existingRating}
          onClose={() => setActiveStoreForRating(null)}
          onSuccess={fetchStores}
        />
      )}
    </div>
  );
}
