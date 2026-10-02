import { useState, useEffect, useCallback } from 'react';
import { storeService } from '../../services/endpoints';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateDisplays';
import StarRating from '../../components/StarRating';
import RatingModal from './RatingModal';
import { Star, MapPin, Edit3, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserMyRatingsPage() {
  const [ratedStores, setRatedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStoreForRating, setActiveStoreForRating] = useState(null);

  const fetchRatedStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await storeService.getStores({ limit: 100 });
      // Filter only stores where user has provided a rating
      const rated = res.data.data.stores.filter((s) => s.userRating !== null);
      setRatedStores(rated);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your submitted ratings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRatedStores();
  }, [fetchRatedStores]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Ratings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and review all ratings you have submitted</p>
        </div>

        <Link
          to="/user/stores"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Store className="w-4 h-4" />
          Explore Stores
        </Link>
      </div>

      {loading ? (
        <LoadingState message="Loading your submitted ratings..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRatedStores} />
      ) : ratedStores.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <EmptyState
            icon={Star}
            title="You have not rated any stores yet"
            description="Explore registered stores and submit your ratings from 1 to 5 stars."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ratedStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-900 text-base line-clamp-1 mb-1">{store.name}</h3>
                <div className="flex items-start gap-1.5 text-xs text-gray-500 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{store.address}</span>
                </div>

                <div className="p-3 bg-primary-50/50 rounded-lg space-y-2 mb-4 border border-primary-100/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Your Rating</span>
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={store.userRating.rating} size={15} />
                      <span className="font-bold text-primary-700">{store.userRating.rating} / 5</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-primary-100">
                    <span className="text-gray-500">Store Average</span>
                    <span className="font-medium text-gray-700">
                      {store.averageRating > 0 ? store.averageRating.toFixed(1) : '—'} / 5 ({store.totalRatings} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveStoreForRating({ store, existingRating: store.userRating })}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Modify Rating
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {activeStoreForRating && (
        <RatingModal
          store={activeStoreForRating.store}
          existingRating={activeStoreForRating.existingRating}
          onClose={() => setActiveStoreForRating(null)}
          onSuccess={fetchRatedStores}
        />
      )}
    </div>
  );
}
