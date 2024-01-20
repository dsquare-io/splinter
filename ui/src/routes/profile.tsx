import {FileRoute, Link, Outlet, ScrollRestoration, useMatchRoute} from '@tanstack/react-router';
import clsx from 'clsx';
import {Avatar} from "@components/Avatar.tsx";
import {
    AdjustmentsVerticalIcon,
    CameraIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    EnvelopeIcon, BellIcon, LockClosedIcon, StarIcon, QuestionMarkCircleIcon, ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/outline";

export const Route = new FileRoute('/profile').createRoute({
    component: ProfileLayout,
});

const settingsOptions = [
    {
        id: 1,
        name: "Preferences",
        items: [
            {
                id: 1,
                name: "Email Settings",
                icon: EnvelopeIcon
            },
            {
                id: 2,
                name: "Device and push notification settings",
                icon: BellIcon,
            },
            {
                id: 3,
                name: "Passcode",
                icon: LockClosedIcon
            }
        ]
    },
    {
        id: 1,
        name: "Feedback",
        items: [
            {
                id: 4,
                name: "Rate this app",
                icon: StarIcon
            },
            {
                id: 5,
                name: "Need any help?",
                icon: QuestionMarkCircleIcon,
            },
        ]
    }
]

function ProfileLayout() {
    const matchRoute = useMatchRoute();
    const isRootLayout = matchRoute({to: '/profile'});

    return (
        <>
            <div
                className={clsx(
                    !isRootLayout && 'hidden xl:block w-96 fixed inset-y-0 left-60 border-e border-slate-200 overflow-auto',
                    isRootLayout && 'xl:w-96 xl:fixed xl:inset-y-0 xl:left-60 xl:border-e xl:border-slate-200 xl:overflow-auto',
                )}
            >
                <div className="px-6 pb-4 pt-6 sticky top-0 bg-white z-10 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Profile</h2>
                    <div className="flex items-center gap-x-2 mt-6">
                        <div className="grow">
                            <label htmlFor="search" className="sr-only">Search</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <MagnifyingGlassIcon className="size-5 text-slate-400"/>
                                </div>
                                <input type="search" name="search" id="search"
                                       className="block w-full rounded-md ring-1 ring-slate-300 py-1.5 pl-10 bg-white/60 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
                                       placeholder="Search"/>
                            </div>
                        </div>

                        <button
                            className="shrink-0 p-2 border border-slate-300 flex items-center justify-center rounded-md hover:bg-slate-50">
                            <AdjustmentsVerticalIcon className="size-5 text-slate-600"/>
                        </button>
                    </div>
                    <div className="flex flex-col gap-3 items-start mt-10">
                        <div className="relative">
                            <Avatar fallback={"AL"} className="size-16 text-3xl bg-slate-200"/>
                            <button className="p-1 rounded-lg bg-slate-50 absolute bottom-0 right-0 cursor-pointer">
                                <CameraIcon className="size-5 text-slate-600"/>
                            </button>
                        </div>
                        <div className="flex items-start justify-between w-full">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-medium text-slate-800">Aman Lohia</h3>
                                <p className="text-sm text-slate-500">amanlohia@email.com</p>
                            </div>
                            <button
                                className="p-2 flex items-center justify-center rounded-md bg-slate-50 hover:bg-slate-100">
                                <PencilIcon className="size-4 text-slate-500"/>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-gray-200">
                    {settingsOptions.map((e) => (
                        <div key={e.id} className="py-4">
                            <h4 className="px-6 text-base font-medium text-slate-800">{e.name}</h4>
                            <div className="mt-2">
                                {e.items.map((e) => (
                                    <Link
                                        to="/profile/$profile"
                                        params={{profile: e.id.toString()}} key={e.id}
                                        className="px-6 flex gap-2 items-center py-4 hover:bg-gray-50">
                                        <e.icon className="size-6 text-slate-500"/>
                                        <p className="font-base text-slate-500">{e.name}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="mt-2">
                        <div className="px-6 flex gap-2 items-center py-4 hover:bg-gray-50">
                            <ArrowLeftOnRectangleIcon className="size-6 text-slate-500"/>
                            <p className="font-base text-slate-500">Logout</p>
                        </div>
                    </div>
                </div>

                <ScrollRestoration/>
            </div>
            <div className="xl:ms-96">
                <Outlet/>
            </div>
        </>
    )
        ;
}
