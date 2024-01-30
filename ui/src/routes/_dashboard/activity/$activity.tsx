import {Avatar} from '@components/common/Avatar.tsx';
import {activities} from '@fake-data/acitivities.ts';
import {
  BriefcaseIcon,
  CameraIcon,
  PaperAirplaneIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {ChevronLeftIcon} from '@heroicons/react/24/solid';
import {Link, Navigate, createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/activity/$activity')({
  component: RootComponent,
});

function RootComponent() {
  const {activity: activityId} = Route.useParams();

  const activity = activities.find((e) => e.id.toString() === activityId);

  if (!activity) {
    return <Navigate to="/activity" />;
  }

  return (
    <div className="flex h-dvh flex-col">
      <Link
        className="mb-1 flex items-center gap-x-1.5 px-6 pb-4 pt-6 text-sm font-medium text-brand-700 xl:hidden"
        to="/activity"
      >
        <ChevronLeftIcon className="size-3" />
        Activity
      </Link>

      <div className="flex w-full items-center justify-end gap-3 px-6 pb-4 pt-6">
        <PencilIcon className="size-5 text-gray-600" />
        <TrashIcon className="size-5 text-gray-600" />
      </div>
      <div className="mt-16 flex items-center justify-center border-b border-gray-200 px-6 pb-8 pt-6">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="rounded-lg bg-blue-50 p-1.5">
            <BriefcaseIcon className="size-12 text-gray-800" />
          </div>
          <h4 className="text-sm font-medium text-gray-900">Travel</h4>
          <div className="flex flex-col items-center">
            <h5 className="text-lg font-semibold text-gray-600">Rs 200</h5>
            <p className="text-xs text-gray-400">Added by you on 31 Dec 2023</p>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col justify-between px-6 pb-8 pt-6">
        <div className="flex items-start gap-x-3">
          <Avatar
            className="size-12 rounded-lg"
            fallback="AF"
          />
          <div className="flex w-full items-start justify-between">
            <div className="grow text-sm font-medium text-gray-800">
              <p>You Paid Rs 100</p>
              <div className="mt-2 font-normal text-gray-400">
                <p className="text-gray-500">Sajeel. Owes you Rs 200</p>
                <p className="text-gray-500">Sajeel. Owes you Rs 400</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">22:36</p>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6">
          <div className="flex items-start gap-2">
            <Avatar
              fallback={'AB'}
              className="size-8 rounded-full"
            />
            <div className="">
              <p className="text-sm text-gray-800">Dummy Comment</p>
              <p className="text-xs text-gray-400">Yesterday, 22:36</p>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="grow">
              <label
                htmlFor="comment"
                className="sr-only"
              >
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 hover:text-gray-900">
                  <CameraIcon className="size-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="comment"
                  id="comment"
                  className="block w-full rounded-md bg-white/60 py-1.5 pl-4 pr-10 ring-1 ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm sm:leading-6"
                  placeholder="Add a comment"
                />
              </div>
            </div>

            <button className="flex shrink-0 items-center justify-center rounded-md p-2 hover:bg-gray-50">
              <PaperAirplaneIcon className="size-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
