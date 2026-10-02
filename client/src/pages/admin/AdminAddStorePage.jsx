import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/endpoints';
import { useToast } from '../../context/ToastContext';
import { validateName, validateEmail, validateAddress } from '../../utils/validators';
import { Store, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAddStorePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);
  const [fetchingOwners, setFetchingOwners] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await adminService.getStoreOwners();
        setStoreOwners(res.data.data);
      } catch (err) {
        toast.error('Failed to load store owners list.');
      } finally {
        setFetchingOwners(false);
      }
    };
    fetchOwners();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const nameErr = validateName(form.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) newErrors.email = emailErr;

    const addressErr = validateAddress(form.address);
    if (addressErr) newErrors.address = addressErr;

    if (!form.ownerId) {
      newErrors.ownerId = 'Please select a store owner.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await adminService.createStore({
        name: form.name,
        email: form.email,
        address: form.address,
        ownerId: Number(form.ownerId),
      });
      toast.success('Store registered successfully.');
      navigate('/admin/stores');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create store.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/stores"
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Add New Store</h1>
          <p className="text-sm text-gray-500 mt-0.5">Register a store outlet and assign it to a store owner</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 mb-1">
              Store Name <span className="text-xs text-gray-400 font-normal">(20-60 chars)</span>
            </label>
            <input
              id="store-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Fresh Supermarket Central Outlet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="store-email" className="block text-sm font-medium text-gray-700 mb-1">
              Store Email
            </label>
            <input
              id="store-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contact@storedomain.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="store-owner" className="block text-sm font-medium text-gray-700 mb-1">
              Store Owner
            </label>
            <select
              id="store-owner"
              name="ownerId"
              value={form.ownerId}
              onChange={handleChange}
              disabled={fetchingOwners}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select a Store Owner</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            {errors.ownerId && <p className="text-xs text-red-500 mt-1">{errors.ownerId}</p>}
            {storeOwners.length === 0 && !fetchingOwners && (
              <p className="text-xs text-amber-600 mt-1">
                No store owners found. Please create a Store Owner user first.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="store-address" className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-xs text-gray-400 font-normal">(max 400 chars)</span>
            </label>
            <textarea
              id="store-address"
              name="address"
              rows={3}
              value={form.address}
              onChange={handleChange}
              placeholder="Enter full physical address of the store..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link
              to="/admin/stores"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
