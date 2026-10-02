import { useEffect, useState } from 'react';
import { adminService } from '../../services/endpoints';
import { LoadingState, ErrorState } from '../../components/StateDisplays';
import StarRating from '../../components/StarRating';
import { X, User, Mail, MapPin, Shield, Store } from 'lucide-react';

export default function AdminUserDetailsModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUserById(userId);
      setUser(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  if (!userId) return null;

  const roleBadgeColors = {
    ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
    USER: 'bg-blue-50 text-blue-700 border-blue-200',
    STORE_OWNER: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <LoadingState message="Fetching user details..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchUserDetails} />
          ) : !user ? null : (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{user.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium border ${roleBadgeColors[user.role]}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Email Address</span>
                    <span className="text-gray-900 break-all">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Physical Address</span>
                    <span className="text-gray-900 leading-relaxed">{user.address || '—'}</span>
                  </div>
                </div>
              </div>

              {/* If Store Owner, show assigned stores and average ratings */}
              {user.role === 'STORE_OWNER' && (
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Managed Stores ({user.stores?.length || 0})
                  </h4>

                  {!user.stores || user.stores.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No stores assigned to this owner yet.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto">
                      {user.stores.map((store) => (
                        <div
                          key={store.id}
                          className="p-3 border border-gray-200 rounded-lg flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-medium text-gray-900 text-sm truncate">{store.name}</p>
                            <p className="text-xs text-gray-400 truncate">{store.address}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <StarRating rating={Math.round(store.averageRating)} size={14} />
                            <span className="text-xs font-bold text-gray-900">
                              {store.averageRating > 0 ? store.averageRating.toFixed(1) : '—'}
                            </span>
                            <span className="text-xs text-gray-400">({store.totalRatings})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
