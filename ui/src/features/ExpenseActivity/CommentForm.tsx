import { Label, TextArea } from 'react-aria-components';

import { ApiRoutes, urlWithArgs } from '@/api-types';
import { FieldError, Form, FormRootErrors, SubmitButton, TextFormField } from '@/components/form';
import { apiQueryOptions } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';

type CommentFormProps = {
  activityId?: string;
};

export function CommentForm({ activityId }: CommentFormProps) {
  if (!activityId) return;

  return (
    <Form
      className="relative flex-auto"
      action={urlWithArgs(ApiRoutes.COMMENT_LIST, { activity_uid: activityId })}
      onSubmitSuccess={async (_, control) => {
        await queryClient.invalidateQueries(apiQueryOptions(ApiRoutes.ACTIVITY_LIST));
        control.reset();
      }}
    >
      <FormRootErrors className="mb-4" />

      <TextFormField
        name="content"
        required
        className="focus-within:border-brand-500 focus-within:ring-brand-400/30 overflow-hidden rounded-lg border border-gray-300 pb-12 shadow-xs focus-within:ring-3"
      >
        <Label className="sr-only">Add your comment</Label>
        <TextArea
          id="content"
          name="content"
          rows={2}
          placeholder="Add your comment..."
          className="block w-full resize-none border-0 bg-transparent px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-hidden sm:text-sm sm:leading-6"
        />
        <FieldError className="pl-3" />
      </TextFormField>
      <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pr-2 pl-3">
        <SubmitButton
          size="small"
          className="bg-white"
          variant="outlined"
        >
          Comment
        </SubmitButton>
      </div>
    </Form>
  );
}
