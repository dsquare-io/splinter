import {ArrowTrendingUpIcon, PlusIcon, UserIcon, UsersIcon} from '@heroicons/react/24/outline';
import {Link} from '@tanstack/react-router';

export default function BottomNav() {
  return (
    <div
      className="md:hidden flex justify-center content-stretch w-full bg-white border-t border-neutral-200 z-10">
      <Link to="/groups"
            className="flex flex-col items-center py-2.5 px-3 text-gray-400 grow max-w-40 -mt-px border-t-2 border-transparent [&.active]:border-brand-600 [&.active]:text-brand-600">
        <UsersIcon className="mb-1 size-6" />
        <span className="font-medium text-xs">Groups</span>
      </Link>

      <Link to="/friends"
            className="flex flex-col items-center py-2.5 px-3 text-gray-400 grow max-w-40 -mt-px border-t-2 border-transparent [&.active]:border-brand-600 [&.active]:text-brand-600">
        <UserIcon className="mb-1 size-6" />
        <span className="font-medium text-xs">Friends</span>
      </Link>

      <div className="px-2 relative">
        <button className="size-12 rounded-full bg-brand-600 -mt-2.5 flex items-center justify-center">
          <PlusIcon className="size-5 text-white" strokeWidth={2} />
          <span className="-inset-x-2.5 inset-y-0 absolute z-10" />
        </button>
      </div>

      <Link to="/activity"
            className="flex flex-col items-center py-2.5 px-3 text-gray-400 grow max-w-40 -mt-px border-t-2 border-transparent [&.active]:border-brand-600 [&.active]:text-brand-600">
        <ArrowTrendingUpIcon className="mb-1 size-6" />
        <span className="font-medium text-xs">Activity</span>
      </Link>

      <Link to="/profile"
            className="flex flex-col items-center py-2.5 px-3 text-gray-400 grow max-w-40 -mt-px border-t-2 border-transparent [&.active]:border-brand-600 [&.active]:text-brand-600">
        <div className="size-6 mb-1 rounded-full border border-gray-200 brand flex items-center justify-center bg-gray-50">
          <span className="text-[10px] font-medium text-gray-600">AF</span>
        </div>
        <span className="font-medium text-xs">Me</span>
      </Link>
    </div>
  );
}
