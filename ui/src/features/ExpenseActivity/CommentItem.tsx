import { Activity } from '@/api-types/components/schemas';
import { Avatar } from '@/components/primitives';
import { formatDistanceShort } from '@/utils/date.ts';

type CommentItemProps = {
  activity: Activity;
  isOwnComment: boolean;
};

export function CommentItem({ activity, isOwnComment }: CommentItemProps) {
  const commentText = activity.target.value;
  const time = formatDistanceShort(new Date(activity.createdAt));

  if (isOwnComment) {
    return (
      <>
        <div className="w-6 shrink-0" />
        <div className="flex flex-1 justify-end gap-x-2">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-gray-400">{time}</span>
            <div className="bg-brand-500 max-w-xs rounded-2xl rounded-tr-sm px-3 py-2 text-sm text-white">
              {commentText}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Avatar
        fallback={activity.actor.name}
        className="relative z-10 size-6 shrink-0 bg-white"
      />
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-xs text-gray-400">
          {activity.actor.name} · {time}
        </span>
        <div className="max-w-xs rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2 text-sm text-gray-900">
          {commentText}
        </div>
      </div>
    </>
  );
}
