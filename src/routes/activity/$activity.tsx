import {FileRoute, Link, Navigate} from '@tanstack/react-router';
import {ChevronLeftIcon} from '@heroicons/react/24/solid';
import {activities} from "@fake-data/acitivities.ts";

export const Route = new FileRoute('/activity/$activity').createRoute({
    component: RootComponent,
});

function RootComponent() {
    const {activity: activityId} = Route.useParams();

    const activity = activities.find((e) => e.id.toString() === activityId);

    if (!activity) {
        return (
            <Navigate to="/activity"/>
        );
    }

    return (
        <div className="px-6 pt-6 pb-4">
            <Link className="flex items-center gap-x-1.5 xl:hidden text-sm text-sky-700 font-medium mb-1" to="/friends">
                <ChevronLeftIcon className="size-3"/>
                Activity
            </Link>
            <h1 className="truncate text-2xl font-bold text-gray-900">{activity.verb}</h1>
        </div>
    );
}
