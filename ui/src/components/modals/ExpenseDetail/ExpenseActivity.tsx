import {Label, TextArea, TextField} from 'react-aria-components';

import {useParams} from '@tanstack/react-router';
import {formatDistanceToNow} from 'date-fns';

import {ApiRoutes} from '@/api-types';
import {Avatar, Button} from '@/components/common';
import {useApiQuery} from '@/hooks/useApiQuery';

export default function ExpenseActivity() {
  const {data} = useApiQuery('/api/user/profile');
  const params = useParams({from: '/_dashboard/groups/$group/$expense'});
  const {data: expense} = useApiQuery(ApiRoutes.EXPENSE_DETAIL, {expense_uid: params.expense});

  return (
    <div>
      <h3 className="mb-4 px-4 text-sm font-medium">Activity Log</h3>

      <ul
        role="list"
        className="space-y-6"
      >
        <li className="relative flex gap-x-3 px-4">
          <div className="absolute -bottom-6 left-4 top-0 flex w-6 justify-center">
            <div className="w-px bg-gray-200"></div>
          </div>
          <div className="relative flex size-6 flex-none items-center justify-center bg-white">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"></div>
          </div>
          <p className="flex-auto py-0.5 text-sm leading-5 text-gray-500">
            <span className="font-medium text-gray-900">{expense?.createdBy?.fullName}</span> created the
            expense.
          </p>
          {expense?.datetime && (
            <time
              dateTime={expense?.datetime}
              className="flex-none py-0.5 text-xs leading-5 text-gray-500"
            >
              {formatDistanceToNow(new Date(expense?.datetime), {addSuffix: true})}
            </time>
          )}
        </li>

        <li className="relative flex gap-x-3 px-4">
          <Avatar
            fallback={data?.fullName}
            className="size-6"
          />
          <div className="relative flex-auto">
            <TextField
              name="comment"
              className="overflow-hidden rounded-lg border border-gray-300 pb-12 shadow-xs focus-within:border-brand-500 focus-within:ring-3 focus-within:ring-brand-400/30"
            >
              <Label className="sr-only">Add your comment</Label>
              <TextArea
                id="comment"
                name="comment"
                rows={2}
                placeholder="Add your comment..."
                className="block w-full resize-none border-0 bg-transparent px-3 py-1.5 text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-0 sm:text-sm sm:leading-6"
              />
            </TextField>

            <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
              <Button
                // type="submit"
                size="small"
                className="bg-white"
                variant="outlined"
              >
                Comment
              </Button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}
