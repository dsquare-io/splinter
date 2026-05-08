import { useRouter } from '@tanstack/react-router';

import Logo from '@/components/Logo.tsx';

export function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-white px-4 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <Logo className="h-10 w-auto" />

        <div>
          <p className="text-8xl font-bold text-gray-100">404</p>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Page not found</h1>
          <p className="mt-2 text-sm text-gray-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.history.back()}
            className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Go back
          </button>
          <a
            href="/"
            className="bg-brand-600 hover:bg-brand-700 rounded-md px-3.5 py-1.5 text-sm font-medium text-white transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
