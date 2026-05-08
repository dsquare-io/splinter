import { useMemo } from 'react';

import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

import { flattenFieldErrors, translateServerError } from '@/components/form/errors.ts';

interface ApiErrorAlertProps {
  error: unknown;
  variant?: 'banner' | 'centered';
  onRetry?: () => void;
}

export function ErrorAlert({ error, variant = 'banner', onRetry }: ApiErrorAlertProps) {
  const { heading, bullets } = useMemo(() => {
    if (!error) return { heading: null, bullets: [] };

    const fieldErrors = translateServerError(error);
    if (fieldErrors.root) return { heading: fieldErrors.root.message!, bullets: [] };

    return {
      heading: 'Oops, something went wrong!',
      bullets: flattenFieldErrors(fieldErrors),
    };
  }, [error]);

  if (!heading) return null;

  if (variant === 'centered') {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-4xl">⚠️</div>
        <div>
          <p className="text-base font-medium text-gray-900">{heading}</p>
          {bullets.length > 0 && (
            <ul className="mt-1 list-disc text-left text-sm text-gray-500">
              {bullets.map((e) => (
                <li key={e.key}>
                  {e.key}: {e.message}
                </li>
              ))}
            </ul>
          )}
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
    <div className="flex items-center gap-x-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
      <ExclamationCircleIcon className="size-4 shrink-0 text-red-500" />
      <span className="flex-1">{heading}</span>
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
