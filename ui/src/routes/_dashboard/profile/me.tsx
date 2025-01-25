import {createFileRoute} from '@tanstack/react-router';

import {Paths} from '@/api-types/routePaths.ts';
import {Avatar} from '@/components/common';
import {useApiQuery} from '@/hooks/useApiQuery.ts';

import ChangePassword from './-change-password.tsx';
import PersonalInfo from './-personal-info.tsx';
import Preferences from './-preferences.tsx';

export const Route = createFileRoute('/_dashboard/profile/me')({
  component: RootComponent,
});

function RootComponent() {
  const {data: profile} = useApiQuery(Paths.PROFILE);

  return (
    <div>
      <div className="relative border-b border-gray-900/5 px-4 pb-6 pt-16 sm:px-6 md:px-8">
        <div
          className="absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
            <div
              className="aspect-1154/678 w-[72.125rem] bg-linear-to-br from-[#267360] to-[#9089FC]"
              style={{
                clipPath:
                  'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
              }}
            />
          </div>
        </div>

        <div className="mx-auto flex max-w-(--breakpoint-lg) items-center gap-x-5 px-4 sm:px-6 lg:px-8">
          <Avatar
            className="size-16 bg-white"
            fallback={profile?.fullName}
          />
          <div>
            <div className="text-xl font-bold text-gray-900 sm:text-2xl">{profile?.fullName}</div>
            <div className="text-sm font-medium text-gray-600">{profile?.email}</div>
          </div>
        </div>
      </div>

      <div className="@container mx-auto max-w-(--breakpoint-lg) divide-y divide-neutral-200">
        <section className="@3xl:grid-cols-3 grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-medium leading-6 text-gray-900">Personal Info</h1>
            <p className="mt-1.5 text-sm text-gray-500">Manage your personal information.</p>
          </div>

          <PersonalInfo />
        </section>

        <section className="@3xl:grid-cols-3 grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-medium leading-6 text-gray-900">Your Preferences</h1>
            <p className="mt-1.5 text-sm text-gray-500">Customize your experience</p>
          </div>

          <Preferences />
        </section>

        <section className="@3xl:grid-cols-3 grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-medium leading-6 text-gray-900">Change Password</h1>
            <p className="mt-1.5 text-sm text-gray-500">Set a different password for your account.</p>
          </div>

          <ChangePassword />
        </section>
      </div>
    </div>
  );
}
