import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      {Icon && <Icon className="w-12 h-12 mb-3 text-gray-300" />}
      <p className="text-base font-medium text-gray-500 mb-1">{title}</p>
      {description && <p className="text-sm text-gray-400">{description}</p>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <span className="text-red-500 text-xl font-bold">!</span>
      </div>
      <p className="text-sm mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Try again
        </button>
      )}
    </div>
  );
}
