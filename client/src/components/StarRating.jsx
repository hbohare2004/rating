import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, maxStars = 5, size = 18, interactive = false, onChange }) {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const filled = i <= rating;
    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange?.(i)}
        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
      >
        <Star
          size={size}
          className={filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
        />
      </button>
    );
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}
