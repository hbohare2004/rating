import { useState, useEffect } from 'react';
import { storeOwnerService } from '../../services/endpoints';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateDisplays';
import StarRating from '../../components/StarRating';
import { Store, Star, Users, MapPin, Calendar, Mail } from 'lucide-react';

export default function OwnerDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await storeOwnerService.getDashboard();
      setDashboardData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch store owner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading store analytics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const stores = dashboardData?.stores || [];

  if (stores.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Store Owner Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview and customer feedback analysis</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <EmptyState
            icon={Store}
            title="No stores assigned"
            description="You do not have any stores assigned to your account yet. Please contact an Administrator."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Store Owner Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your store performance and customer ratings</p>
      </div>

      {stores.map((store) => (
        <div key={store.id} className="space-y-6">
          {/* Store Header & Stats Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold flex-shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{store.name}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{store.address}</span>
                  </div>
                </div>
              </div>

              {/* Rating Highlight */}
              <div className="flex items-center gap-4 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 self-start md:self-auto">
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average Rating</p>
                  <p className="text-2xl font-black text-gray-900 leading-none mt-1">
                    {store.averageRating > 0 ? store.averageRating.toFixed(1) : '0.0'}{' '}
                    <span className="text-sm font-medium text-gray-400">/ 5</span>
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <StarRating rating={Math.round(store.averageRating)} size={18} />
                  <span className="text-xs text-gray-400 mt-1">({store.totalRatings} total reviews)</span>
                </div>
              </div>
            </div>

            {/* Rating Distribution Breakdown */}
            <div className="p-6 bg-gray-50/50">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Rating Breakdown</h3>
              <div className="space-y-2 max-w-md">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = store.distribution?.[star] || 0;
                  const pct = store.totalRatings > 0 ? Math.round((count / store.totalRatings) * 100) : 0;

                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 w-12 text-gray-600 font-medium">
                        <span>{star}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-gray-500">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Customer Reviews Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Submitted Ratings</h3>
                <p className="text-xs text-gray-500 mt-0.5">Customers who provided feedback for this store</p>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {store.ratings?.length || 0} customer reviews
              </span>
            </div>

            {!store.ratings || store.ratings.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Star}
                  title="No ratings submitted yet"
                  description="When customers rate your store, their reviews and ratings will be listed here."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Customer Name</th>
                      <th className="px-6 py-3.5">Email</th>
                      <th className="px-6 py-3.5">Rating</th>
                      <th className="px-6 py-3.5 text-right">Submitted On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {store.ratings.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {r.userName}
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {r.userEmail}
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
      ))}
    </div>
  );
}
