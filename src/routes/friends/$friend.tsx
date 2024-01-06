import {FileRoute, Link, Navigate} from '@tanstack/react-router';
import {friends} from '@fake-data/friends.ts';
import {ChevronLeftIcon} from '@heroicons/react/24/solid';

export const Route = new FileRoute('/friends/$friend').createRoute({
  component: RootComponent,
});

function RootComponent() {
  const {friend: friendId} = Route.useParams();

  const friend = friends.find((e) => e.id.toString() === friendId);

  if (!friend) {
    return (
      <Navigate to="/friends" />
    );
  }

  return (
    <div className="px-6 pt-6 pb-4">
      <Link className="flex items-center gap-x-1.5 xl:hidden text-sm text-sky-700 font-medium mb-1" to="/friends">
        <ChevronLeftIcon className="size-3" />
        Friend
      </Link>
      <h1 className="truncate text-2xl font-bold text-gray-900">{friend.name}</h1>
    </div>
  );
}
