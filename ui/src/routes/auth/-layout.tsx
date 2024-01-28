import { ReactNode } from 'react';
import Logo from '../../Logo.tsx';

export default function AuthLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-sm space-y-10">
          <div>
            <Logo className="mx-auto h-10 w-auto" />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          {children}
        </div>
      </div>
    </>
  );
}