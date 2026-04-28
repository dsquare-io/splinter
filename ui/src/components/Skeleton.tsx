import { twMerge } from 'tailwind-merge';

export function Skeleton({ className }: { className?: string }) {
  return <div className={twMerge('animate-pulse rounded bg-gray-200', className)} />;
}

export function FriendListItemSkeleton() {
  return (
    <div className="flex items-center gap-x-3 border-y border-gray-200 px-6 py-4">
      <Skeleton className="size-9 rounded-full" />
      <Skeleton className="h-4 flex-1" />
      <div className="space-y-1.5 text-right">
        <Skeleton className="ml-auto h-2.5 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function GroupListItemSkeleton() {
  return (
    <div className="flex items-center gap-x-3 border-y border-gray-200 px-6 py-4">
      <Skeleton className="size-9 rounded-lg" />
      <Skeleton className="h-4 flex-1" />
      <div className="space-y-1.5 text-right">
        <Skeleton className="ml-auto h-2.5 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function ActivityListItemSkeleton() {
  return (
    <div className="flex gap-x-3 px-6 py-3">
      <Skeleton className="size-12 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2.5 w-1/4" />
      </div>
    </div>
  );
}

export function ExpenseListItemSkeleton() {
  return (
    <div className="flex items-center gap-x-4 py-3">
      <div className="flex shrink-0 flex-col items-center gap-y-1">
        <Skeleton className="h-2 w-6" />
        <Skeleton className="h-5 w-6" />
      </div>
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="space-y-1 text-right">
        <Skeleton className="ml-auto h-2.5 w-14" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}

export function ExpenseListSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="mt-4 mb-3 h-4 w-16" />
      <div>
        {Array.from({ length: count }).map((_, i) => (
          <ExpenseListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
