import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/endpoints';
import { LoadingState, ErrorState } from '../../components/StateDisplays';
import { Users, Store, Star, PlusCircle, UserPlus, ArrowUpRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getDashboard();
      setStats(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="Loading platform overview..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStats} />;

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      description: 'Registered platform accounts',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      link: '/admin/users',
    },
    {
      title: 'Total Stores',
      value: stats?.totalStores?.toLocaleString() || '0',
      description: 'Active stores on platform',
      icon: Store,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      link: '/admin/stores',
    },
    {
      title: 'Total Ratings',
      value: stats?.totalRatings?.toLocaleString() || '0',
      description: 'Ratings submitted by customers',
      icon: Star,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      link: '/admin/stores',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">System Administrator Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform overview and management controls</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/add-store"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-gray-500" />
            Add Store
          </Link>
          <Link
            to="/admin/add-user"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.description}</p>
              </div>
              <div className={`p-2.5 rounded-lg border ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-medium text-primary-600 group-hover:text-primary-700">
              <span>View details</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Access Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Store Management</h2>
              <p className="text-xs text-gray-500">Manage registered stores and review overall ratings</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Browse all stores on the platform, sort by ratings, name, or email, and register new store outlets under designated store owners.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              to="/admin/stores"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              Browse all stores &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">User Management</h2>
              <p className="text-xs text-gray-500">View and manage platform users across all roles</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Search and filter users by name, email, address, or role (Admin, User, Store Owner). View detailed store owner performance and ratings.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              to="/admin/users"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              Browse all users &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
