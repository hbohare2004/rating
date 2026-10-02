import { useState, useEffect } from 'react';
import { authService } from '../../services/endpoints';
import { useAuth } from '../../context/AuthContext';
import { LoadingState, ErrorState } from '../../components/StateDisplays';
import { User, Mail, MapPin, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.getProfile();
      setProfile(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <LoadingState message="Loading profile..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProfile} />;
  if (!profile) return null;

  const roleLabels = {
    ADMIN: 'System Administrator',
    USER: 'Normal User',
    STORE_OWNER: 'Store Owner',
  };

  const roleBadgeColors = {
    ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
    USER: 'bg-blue-50 text-blue-700 border-blue-200',
    STORE_OWNER: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">User Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your personal account information and assigned role</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-bold">
            {profile.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{profile.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColors[profile.role]}`}>
                {roleLabels[profile.role]}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-500">Email Address</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5 break-all">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-500">Platform Role</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{profile.role}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500">Registered Address</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5 leading-relaxed">{profile.address || 'No address provided'}</p>
            </div>
          </div>

          {profile.createdAt && (
            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {new Date(profile.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
