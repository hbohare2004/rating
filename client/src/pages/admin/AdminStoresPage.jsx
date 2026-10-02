import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/endpoints';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateDisplays';
import StarRating from '../../components/StarRating';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Store, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStores({
        search: search.trim() || undefined,
        sortBy,
        sortOrder,
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
  }, [search, sortBy, sortOrder, pagination.page, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const renderSortIcon = (field) => {
    return (
      <ArrowUpDown
        className={`w-3.5 h-3.5 inline ml-1 transition-colors ${
          sortBy === field ? 'text-primary-600' : 'text-gray-300'
        }`}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Stores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage registered stores and review overall customer ratings</p>
        </div>

        <Link
          to="/admin/add-store"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Store
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by store name, email, or address..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState message="Loading stores..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchStores} />
        ) : stores.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No stores found"
            description={search ? 'Try adjusting your search criteria.' : 'No stores have been registered yet.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Store Name {renderSortIcon('name')}
                  </th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('email')}
                  >
                    Email {renderSortIcon('email')}
                  </th>
                  <th className="px-6 py-3.5">Address</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors text-right"
                    onClick={() => handleSort('rating')}
                  >
                    Overall Rating {renderSortIcon('rating')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {store.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {store.email}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={store.address}>
                      {store.address}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {store.owner?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <StarRating rating={Math.round(store.averageRating)} size={15} />
                        <span className="font-semibold text-gray-900 text-sm">
                          {store.averageRating > 0 ? store.averageRating.toFixed(1) : '—'}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({store.totalRatings})
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
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
      </div>
    </div>
  );
}
