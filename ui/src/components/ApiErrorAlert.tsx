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

export function ApiErrorAlert({ error }: { error: unknown }) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-x-2 bg-red-50 px-4 py-2 text-sm text-red-700 sm:px-6 md:px-8">
      <ExclamationCircleIcon className="size-4 shrink-0 text-red-500" />
      {getErrorMessage(error)}
    </div>
  );
}
