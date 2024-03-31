import {CameraIcon, PaperAirplaneIcon, TrashIcon} from '@heroicons/react/24/outline';
import {ChevronLeftIcon} from '@heroicons/react/24/solid';
import {Link, createFileRoute} from '@tanstack/react-router';
import groupBy from 'just-group-by';

import {urlWithArgs} from '@/api-types';
import {Paths} from '@/api-types/routePaths.ts';
import {axiosInstance} from '@/axios.ts';
import Currency from '@/components/Currency.tsx';
import {Avatar, Button, FieldError, Form, Input, TextFormField} from '@/components/common';
import {apiQueryOptions} from '@/hooks/useApiQuery.ts';
import {useConfirmation} from '@/hooks/useConfirmation.tsx';
import {queryClient} from '@/queryClient.ts';

export const Route = createFileRoute('/_dashboard/activity/$activity')({
  component: RootComponent,
});

function RootComponent() {
  const {activity: activity_uid} = Route.useParams();
  const confirm = useConfirmation();

  // const {data} = useApiQuery(ApiRoutes.ACTIVITY_LIST);
  // const currentActivity = data?.results.find((activity) => activity.uid === activity_uid);
  // if (!currentActivity) return null;
  // console.log(currentActivity, data);
  const data = {
    uid: 'activity-1',
    urn: 'urn:activity:1',
    user: {
      uid: 'user-1',
      urn: 'urn:user:1',
      fullName: 'John Doe',
      isActive: true,
    },
    group: {
      uid: 'group-1',
      urn: 'urn:group:1',
      name: 'Apartment Buddies',
    },
    template: 'DINNER',
    description: 'Dinner at Pizza Palace',
    target: {
      uid: 'target-1',
      urn: 'urn:target:1',
      value: 35.75,
    },
    createdAt: '2024-03-23T18:00:00Z',
  };
  const commentsData = {
    count: 123, // Number of comments retrieved (replace with actual count)
    next: 'https://api.example.org/accounts/?offset=400&limit=100',
    previous: 'https://api.example.org/accounts/?offset=200&limit=100',
    results: [
      {
        uid: 'comment-1',
        urn: 'urn:comment:1',
        user: {
          uid: 'user-1',
          urn: 'urn:user:1',
          fullName: 'John Doe',
          isActive: true,
        },
        content: "This looks great! Can't wait to see the final product.",
        createdAt: '2024-03-24T10:00:00Z',
      },
      {
        uid: 'comment-2',
        urn: 'urn:comment:2',
        user: {
          uid: 'user-2',
          urn: 'urn:user:2',
          fullName: 'Jane Smith',
          isActive: true,
        },
        content: 'I have a suggestion for improvement...',
        createdAt: '2024-03-23T15:30:00Z',
      },
    ],
  };

  async function deleteComment(comment_uid: string) {
    return confirm({
      title: 'Delete comment',
      description: (
        <>
          Are you sure you want to delete <span className="font-medium text-gray-800">Comment</span> group?
          This action cannot be undone.
        </>
      ),
      callback: async () => {
        await axiosInstance.delete(
          urlWithArgs(Paths.COMMENT_DETAIL, {
            activity_uid,
            comment_uid,
          })
        );
        await queryClient.invalidateQueries(apiQueryOptions(Paths.COMMENT_LIST, {activity_uid}));
        return null;
      },
    });
  }

  function formatDate(dateString: string) {
    const [month, year] = dateString.split('/');

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthName = months[parseInt(month, 10) - 1];

    return `${monthName} ${year}`;
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    // @ts-ignore
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    let formattedDate;
    if (daysDiff === 0) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      formattedDate = `Today at ${hours}:${minutes} PM`;
    } else if (daysDiff === -1) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      formattedDate = `Yesterday at ${hours}:${minutes} PM`;
    } else {
      const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
      formattedDate = date.toLocaleDateString('en-US', options);
    }
    return formattedDate.split('at')[1];
  }

  return (
    <div className="flex h-screen flex-col justify-between">
      <div>
        <div className="relative grid items-center justify-start gap-x-5 border-b border-gray-900/5 px-4 pb-6 pt-10 sm:px-6 md:px-8">
          <div
            className="absolute inset-0 -z-10 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
              <div
                className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#267360] to-[#9089FC]"
                style={{
                  clipPath:
                    'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
                }}
              ></div>
            </div>
          </div>

          <Link
            className="col-span-2 mb-1 flex items-center gap-x-1.5 px-6 pb-4 pt-6 text-sm font-medium text-brand-700 xl:hidden"
            to="/activity"
          >
            <ChevronLeftIcon className="size-3" />
            Activity
          </Link>

          <div className="flex flex-col items-start gap-2">
            <Avatar
              className="size-16 bg-white"
              fallback={data.template}
            />
            <div className="mt-1 text-2xl font-semibold text-gray-900">{data.template}</div>
            <p>
              {+data.target.value > 0 && <>{data.user.fullName} borrowed </>}
              {+data.target.value < 0 && <>You lent </>}
              <Currency
                currency="PKR"
                value={data.target.value}
              />
              {data.group && <> in {data.group.name}</>}
            </p>
          </div>
        </div>
      </div>
      <div className="my-3 px-4 sm:px-6 md:px-8">
        <div className="inset-y-0 flex flex-col justify-between justify-items-start gap-6">
          <div className="-space-y-px">
            {Object.entries(
              groupBy(commentsData?.results ?? [], (comment) => {
                const dateObj = new Date(comment.createdAt ?? '');
                return dateObj.toLocaleDateString('en-US', {year: 'numeric', month: 'numeric'});
              })
            )
              .sort((a, b) => (a[0] < b[0] ? -1 : +1))
              .map(([date, comments]) => (
                <div
                  key={date}
                  className="relative space-y-6"
                >
                  <div className="sticky top-[96px]  px-6 py-1 text-center text-sm font-medium text-gray-500">
                    <h3 className="uppercase">{formatDate(date)}</h3>
                  </div>
                  <div className="flex flex-col justify-start gap-8">
                    {comments.map((comment) => (
                      <div
                        key={comment.uid}
                        className="flex w-full items-start gap-2"
                      >
                        <Avatar
                          className="size-8 bg-white"
                          fallback={comment.user.fullName}
                        />
                        <div className="w-max space-y-1 rounded-md bg-gray-100 p-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-900">{comment.user.fullName}</p>
                            <p className="text-xs text-gray-400">{formatTime(comment.createdAt)}</p>
                          </div>
                          <p className="text-sm text-gray-500">{comment.content}</p>
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-x-3 rounded px-2 py-2.5 text-gray-700 hover:bg-gray-100 focus:outline-none"
                          onClick={() => deleteComment(comment.uid)}
                        >
                          <TrashIcon className="size-4 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
          <Form
            action={urlWithArgs(Paths.COMMENT_LIST, {activity_uid})}
            method="POST"
            onSubmitSuccess={() =>
              queryClient.invalidateQueries(apiQueryOptions(Paths.COMMENT_LIST, {activity_uid}))
            }
            className="flex items-center gap-x-2"
          >
            <TextFormField
              name="comment"
              className="grow"
              aria-label="comment"
            >
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Add a comment"
                />
                <Button
                  size="small"
                  variant="plain"
                  slot={null}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 hover:text-gray-900"
                >
                  <CameraIcon className="size-5 text-gray-400" />
                </Button>
              </div>
              <FieldError />
            </TextFormField>
            <Button
              size="small"
              variant="plain"
              type="submit"
              slot="submit"
            >
              <PaperAirplaneIcon className="size-5 text-gray-600" />
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
