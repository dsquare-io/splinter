import {FileRoute, Link, Navigate} from '@tanstack/react-router';
import {ChevronLeftIcon} from '@heroicons/react/24/solid';
import {activities} from "@fake-data/acitivities.ts";
import {
    BriefcaseIcon, CameraIcon,
    PaperAirplaneIcon,
    PencilIcon,
    TrashIcon
} from "@heroicons/react/24/outline";
import {Avatar} from "@components/Avatar.tsx";

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
        <div className="flex flex-col h-dvh">
            <Link className="px-6 pt-6 pb-4 flex items-center gap-x-1.5 xl:hidden text-sm text-sky-700 font-medium mb-1"
                  to="/activity">
                <ChevronLeftIcon className="size-3"/>
                Activity
            </Link>

            <div className="flex gap-3 items-center justify-end w-full px-6 pt-6 pb-4">
                <PencilIcon className="size-5 text-gray-600"/>
                <TrashIcon className="size-5 text-gray-600"/>
            </div>
            <div className="flex items-center justify-center mt-16 border-b border-gray-200 px-6 pt-6 pb-8">
                <div className="flex flex-col items-center justify-center gap-1">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                        <BriefcaseIcon className="size-12 text-gray-800"/>
                    </div>
                    <h4 className="font-medium text-sm text-gray-900">Travel</h4>
                    <div className='flex flex-col items-center'>
                        <h5 className="font-semibold text-lg text-gray-600">Rs 200</h5>
                        <p className="text-xs text-gray-400">Added by you on 31 Dec 2023</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-between h-full px-6 pt-6 pb-8">

                <div
                    className="flex gap-x-3 items-start"
                >
                    <Avatar className="size-12 rounded-lg" fallback="AF"/>
                    <div className="flex items-start justify-between w-full">
                        <div className="grow text-sm font-medium text-slate-800">
                            <p>
                                You Paid Rs 100
                            </p>
                            <div className="mt-2 font-normal text-slate-400">
                                <p className="text-slate-500">Sajeel. Owes you Rs 200</p>
                                <p className="text-slate-500">Sajeel. Owes you Rs 400</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">22:36</p>
                    </div>

                </div>
                <div className="flex flex-col justify-between gap-6">
                    <div className="flex items-start gap-2">
                        <Avatar fallback={"AB"} className="size-8 rounded-full"/>
                        <div className="">
                            <p className="text-sm text-slate-800">Dummy Comment</p>
                            <p className="text-xs text-slate-400">Yesterday, 22:36</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <div className="grow">
                            <label htmlFor="comment" className="sr-only">Search</label>
                            <div className="relative">
                                <div
                                    className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 hover:text-slate-900">
                                    <CameraIcon className="size-5 text-slate-400"/>
                                </div>
                                <input type="text" name="comment" id="comment"
                                       className="block w-full rounded-md ring-1 pl-4 ring-slate-300 py-1.5 pr-10 bg-white/60 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
                                       placeholder="Add a comment"/>
                            </div>
                        </div>

                        <button
                            className="shrink-0 p-2  flex items-center justify-center rounded-md hover:bg-slate-50">
                            <PaperAirplaneIcon className="size-5 text-slate-600"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
