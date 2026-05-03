import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { isAxiosError } from 'axios';

function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return 'Something went wrong. Please try again.';

  const status = error.response?.status;
  if (!status) return 'Network error. Please check your connection.';
  if (status === 401) return 'You are not authorized to view this.';
  if (status === 403) return 'You do not have permission to access this.';
  if (status === 404) return 'The requested resource could not be found.';
  if (status >= 500) return 'Server error. Please try again later.';
  return 'Something went wrong. Please try again.';
}

interface ApiErrorAlertProps {
  error: unknown;
  variant?: 'banner' | 'centered';
  onRetry?: () => void;
}

export function ApiErrorAlert({ error, variant = 'banner', onRetry }: ApiErrorAlertProps) {
  if (!error) return null;

  if (variant === 'centered') {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-4xl">⚠️</div>
        <div>
          <p className="text-base font-medium text-gray-900">Something went wrong</p>
          <p className="mt-1 text-sm text-gray-500">{getErrorMessage(error)}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-brand-600 hover:bg-brand-700 rounded-md px-3.5 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2 bg-red-50 px-4 py-2 text-sm text-red-700 sm:px-6 md:px-8">
      <ExclamationCircleIcon className="size-4 shrink-0 text-red-500" />
      <span className="flex-1">{getErrorMessage(error)}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="font-medium underline hover:no-underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
