import clsx from 'clsx';
import { useMemo } from 'react';

import { ExclamationCircleIcon as ExclamationCircleIconSm } from '@heroicons/react/16/solid';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  ServerIcon,
  SignalSlashIcon,
} from '@heroicons/react/24/outline';
import { isAxiosError } from 'axios';

import { flattenFieldErrors, translateServerError } from '@/components/form/errors.ts';
import { Button } from '@/components/primitives';

function deriveIcon(error: unknown, size: 'sm' | 'lg') {
  const cls = size === 'lg' ? 'size-10' : 'size-4 shrink-0';

  if (size === 'sm') return <ExclamationCircleIconSm className={clsx(cls, 'text-red-500')} />;

  if (!isAxiosError(error)) return <ExclamationCircleIcon className={clsx(cls, 'text-red-500')} />;
  if (!error.response) return <SignalSlashIcon className={clsx(cls, 'text-gray-400')} />;

  const status = error.response.status;
  if (status === 401 || status === 403) return <LockClosedIcon className={clsx(cls, 'text-red-400')} />;
  if (status >= 500) return <ServerIcon className={clsx(cls, 'text-red-400')} />;
  return <ExclamationTriangleIcon className={clsx(cls, 'text-yellow-500')} />;
}

interface ApiErrorAlertProps {
  error: unknown;
  variant?: 'banner' | 'card' | 'centered';
  onRetry?: () => void;
  onLogout?: () => void;
}

export function ErrorAlert({ error, variant = 'banner', onRetry, onLogout }: ApiErrorAlertProps) {
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

  if (variant === 'centered' || variant === 'card') {
    return (
      <div
        className={clsx(
          'flex flex-col items-center justify-center gap-4 px-4 text-center',
          variant === 'centered' && 'h-full min-h-64'
        )}
      >
        {deriveIcon(error, 'lg')}
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
        <div className="flex gap-2">
          {onLogout && (
            <Button
              variant="outlined"
              onPress={onLogout}
            >
              Log out
            </Button>
          )}
          {onRetry && (
            <Button
              color="brand"
              onPress={onRetry}
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
      {deriveIcon(error, 'sm')}
      <span className="flex-1">{heading}</span>
      {onRetry && (
        <Button
          variant="plain"
          color="danger"
          size="small"
          onPress={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}
