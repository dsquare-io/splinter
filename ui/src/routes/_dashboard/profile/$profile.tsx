import { createFileRoute, Link } from '@tanstack/react-router';
import {ChevronLeftIcon} from '@heroicons/react/24/solid';

export const Route = createFileRoute('/_dashboard/profile/$profile')({
  component: RootComponent,
});

function RootComponent() {

  return (
    <div className="px-6 pt-6 pb-4">
      <Link className="flex items-center gap-x-1.5 xl:hidden text-sm text-brand-700 font-medium mb-1" to="/friends">
        <ChevronLeftIcon className="size-3" />
        Account Settings
      </Link>
      <article>
        <h3 className="text-lg font-medium text-gray-800">Account Settings</h3>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="first-name" className="block text-sm leading-6 text-gray-600">
              First name
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="first-name"
                id="first-name"
                autoComplete="given-name"
                className="block w-full rounded-md ring-1 ring-gray-300 py-1.5 px-4 bg-white/60 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm sm:leading-6"

              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="last-name" className="block text-sm  leading-6 text-gray-600">
              Last name
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="last-name"
                id="last-name"
                autoComplete="family-name"
                className="block w-full rounded-md ring-1 ring-gray-300 py-1.5 px-4 bg-white/60 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm sm:leading-6"

              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="email" className="block text-sm  leading-6 text-gray-600">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="block w-full rounded-md ring-1 ring-gray-300 py-1.5 px-4 bg-white/60 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm sm:leading-6"

              />
            </div>
          </div>
          <div className="sm:col-span-4">
            <label htmlFor="password" className="block text-sm  leading-6 text-gray-600">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="password"
                className="block w-full rounded-md ring-1 ring-gray-300 py-1.5 px-4 bg-white/60 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm sm:leading-6"

              />
            </div>
          </div>


          <div className="sm:col-span-2">
            <label htmlFor="region" className="block text-sm  leading-6 text-gray-600">
              State / Province
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="region"
                id="region"
                autoComplete="address-level1"
                className="block w-full rounded-md ring-1 ring-gray-300 py-1.5 px-4 bg-white/60 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
        <div className="border-b border-gray-900/10 pb-12 mt-8">
          <h2 className="text-base font-medium leading-7 text-gray-800">Notifications</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            We'll always let you know about important changes, but you pick what else you want to hear
            about.
          </p>

          <div className="mt-10 space-y-10">
            <fieldset>
              <legend className="text-sm font-medium leading-6 text-gray-800">By Email</legend>
              <div className="mt-6 space-y-6">
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="comments"
                      name="comments"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="comments" className="block text-sm leading-6 text-gray-600">
                      Comments
                    </label>
                    <p className="text-gray-500">Get notified when someones posts a comment on a
                      posting.</p>
                  </div>
                </div>
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="candidates"
                      name="candidates"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="candidates" className="block text-sm leading-6 text-gray-600">
                      Candidates
                    </label>
                    <p className="text-gray-500">Get notified when a candidate applies for a
                      job.</p>
                  </div>
                </div>
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="offers"
                      name="offers"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="offers" className="block text-sm leading-6 text-gray-600">
                      Offers
                    </label>
                    <p className="text-gray-500">Get notified when a candidate accepts or rejects an
                      offer.</p>
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-medium leading-6 text-gray-800">Push Notifications
              </legend>
              <p className="mt-1 text-sm leading-6 text-gray-500">These are delivered via SMS to your
                mobile phone.</p>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-everything"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="push-everything"
                         className="block text-sm  leading-6 text-gray-600">
                    Everything
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-email"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="push-email"
                         className="block text-sm  leading-6 text-gray-600">
                    Same as email
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-nothing"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="push-nothing"
                         className="block text-sm  leading-6 text-gray-600">
                    No push notifications
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
        </div>


        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button type="button" className="text-sm font-medium leading-6 text-gray-800">
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Save
          </button>
        </div>
      </article>

    </div>
  );
}


