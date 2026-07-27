import { ReactNode } from 'react';

import { KeyboardSpacer } from '@/components/KeyboardSpacer.tsx';
import { Logo } from '@/components/Logo.tsx';

type AuthLayoutProps = {
  children?: ReactNode;
  title: string;
  subtitle?: string;
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 pt-12 pb-4 sm:px-6 lg:px-8">
        <div className="min-h-0 w-full max-w-sm space-y-4">
          <Logo className="mx-auto size-12" />
          <h2 className="mt-4 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          {subtitle && <p className="text-center leading-9 tracking-tight text-gray-500">{subtitle}</p>}

          {children}
        </div>
      </div>
      <KeyboardSpacer />
    </div>
  );
}
