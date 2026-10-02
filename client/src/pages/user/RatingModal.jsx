import { useState } from 'react';
import { ratingService } from '../../services/endpoints';
import { useToast } from '../../context/ToastContext';
import StarRating from '../../components/StarRating';
import { X, Loader2, Star } from 'lucide-react';

export default function RatingModal({ store, existingRating, onClose, onSuccess }) {
  const [rating, setRating] = useState(existingRating?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const isModifying = Boolean(existingRating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isModifying) {
        await ratingService.updateRating(existingRating.id, { rating });
        toast.success('Rating updated successfully.');
      } else {
        await ratingService.submitRating({ storeId: store.id, rating });
        toast.success('Rating submitted successfully.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save rating.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {isModifying ? 'Modify Your Rating' : 'Rate Store'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 text-center space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{store?.name}</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto truncate">{store?.address}</p>
          </div>

          <div className="py-2">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= displayRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-115 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        filled ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-sm font-medium text-gray-700 mt-3 h-5">
              {ratingLabels[displayRating] || 'Select your rating'} ({displayRating} / 5)
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm w-1/2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm w-1/2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isModifying ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
