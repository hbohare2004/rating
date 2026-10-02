import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/endpoints';
import { useToast } from '../../context/ToastContext';
import { validateName, validateEmail, validatePassword, validateAddress } from '../../utils/validators';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAddUserPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    const passErr = validatePassword(form.password);
    if (passErr) newErrors.password = passErr;

    const addressErr = validateAddress(form.address);
    if (addressErr) newErrors.address = addressErr;

    if (!form.role) {
      newErrors.role = 'Please select a role.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await adminService.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        address: form.address,
        role: form.role,
      });
      toast.success('User account created successfully.');
      navigate('/admin/users');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user account.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/users"
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Add New User</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a user account with specified platform role</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-xs text-gray-400 font-normal">(20-60 chars)</span>
            </label>
            <input
              id="user-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Jonathan Alexander Pierce"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="user-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-xs text-gray-400 font-normal">(8-16 chars, 1 uppercase, 1 special)</span>
            </label>
            <input
              id="user-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="user-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>

          <div>
            <label htmlFor="user-address" className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-xs text-gray-400 font-normal">(max 400 chars)</span>
            </label>
            <textarea
              id="user-address"
              name="address"
              rows={3}
              value={form.address}
              onChange={handleChange}
              placeholder="Enter full physical address..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link
              to="/admin/users"
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
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
