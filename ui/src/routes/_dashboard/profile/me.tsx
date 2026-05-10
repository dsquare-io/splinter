import { ArrowLeftStartOnRectangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { createFileRoute } from '@tanstack/react-router';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { Avatar, Button, DetailHeader } from '@/components/primitives';
import { useAuth } from '@/hooks/useAuth.ts';
import { ChangePassword } from './-change-password.tsx';
import { PersonalInfo } from './-personal-info.tsx';
import { Preferences } from './-preferences.tsx';

export const Route = createFileRoute('/_dashboard/profile/me')({
  component: RootComponent,
});

function RootComponent() {
  const { currentUser, setToken } = useAuth();
  const { updateServiceWorker } = useRegisterSW();

  return (
    <div className="h-full flex-col overflow-auto">
      <DetailHeader>
        <div className="mx-auto flex max-w-(--breakpoint-lg) items-center gap-x-5 px-4 sm:px-6 lg:px-8">
          <Avatar
            className="size-16 bg-white"
            fallback={currentUser?.name}
          />
          <div>
            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{currentUser?.name}</div>
            <div className="text-sm font-medium text-gray-600">{currentUser?.email}</div>
          </div>
        </div>
      </DetailHeader>

      <div className="@container mx-auto max-w-(--breakpoint-lg) divide-y divide-neutral-200">
        <section className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 lg:px-8 @3xl:grid-cols-3">
          <div>
            <h1 className="text-lg leading-6 font-medium text-gray-900">Personal Info</h1>
            <p className="mt-1.5 text-sm text-gray-500">Manage your personal information.</p>
          </div>

          <PersonalInfo />
        </section>

        <section className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 lg:px-8 @3xl:grid-cols-3">
          <div>
            <h1 className="text-lg leading-6 font-medium text-gray-900">Your Preferences</h1>
            <p className="mt-1.5 text-sm text-gray-500">Customize your experience</p>
          </div>

          <Preferences />
        </section>

        <section className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 lg:px-8 @3xl:grid-cols-3">
          <div>
            <h1 className="text-lg leading-6 font-medium text-gray-900">Change Password</h1>
            <p className="mt-1.5 text-sm text-gray-500">Set a different password for your account.</p>
          </div>

          <ChangePassword />
        </section>

        <section className="space-y-3 px-4 py-8 sm:px-6 md:hidden">
          <Button
            variant="outlined"
            color="default"
            className="w-full"
            onPress={async () => {
              await updateServiceWorker(true);
            }}
          >
            <ArrowPathIcon data-slot="icon" />
            Refresh App
          </Button>
          <Button
            variant="outlined"
            color="danger"
            className="w-full"
            onPress={() => {
              setToken();
              window.location.href = '/auth/login';
            }}
          >
            <ArrowLeftStartOnRectangleIcon data-slot="icon" />
            Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
