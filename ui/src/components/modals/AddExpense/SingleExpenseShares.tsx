import {Button} from 'react-aria-components';

import {MinusIcon, PlusIcon} from '@heroicons/react/24/outline';

import {Avatar, Checkbox, Input, NumberFormField, useScopedFieldName, WatchState} from '@/components/common';
import {FormField} from '@/components/common/Form/FormField.tsx';

import {useExpenseParticipants} from './useExpenseParticipants';
import {useFormContext} from 'react-hook-form';
import {applyTransformers} from '../../common/Form/transformers.ts';

export function SingleExpenseShares() {
  const participants = useExpenseParticipants();
  const form = useFormContext();
  const showSharesName = useScopedFieldName('shares:del');

  return (
    <div className="-mx-4 grid grid-cols-[1fr_auto] divide-y divide-neutral-100 overflow-y-auto sm:-mx-6">
      <div className="px-4 sm:px-6">
        <Checkbox
          shape="circle"
          className="flex gap-x-3 py-2 text-sm text-neutral-800"
          onChange={(checked) => {
            const data = form.getValues(showSharesName);
            for (const key of Object.keys(data)) {
              form.setValue([showSharesName, key, 'show'].join('.'), checked);
            }
          }}
        >
          All
        </Checkbox>
      </div>
      <button onClick={() => console.log(applyTransformers(form.getValues()))}>test</button>
      {participants.map((user) => (
        <div
          key={user.urn}
          className="col-span-3 grid grid-cols-subgrid items-center gap-x-3 px-4 py-1.5 sm:px-6"
        >
          <div>
            <FormField name={`shares:del.${user.uid}.show`}>
              <Checkbox
                shape="circle"
                className="gap-x-3 py-2"
              >
                <div className="flex items-center gap-x-2">
                  <Avatar fallback={user.fullName} />
                  <div className="text-neutral-800">{user.fullName}</div>
                </div>
              </Checkbox>
            </FormField>
          </div>

          <WatchState name={`shares:del.${user.uid}.show`}>
            {(show) =>
              show && (
                <NumberFormField
                  className="relative"
                  aria-label="share"
                  defaultValue={1}
                  name={`shares:to_dict__user__share.${user.uid}`}
                  shouldUnregister
                >
                  <Button
                    className="absolute inset-y-0 left-2 z-10 text-neutral-600 hover:text-neutral-700"
                    slot="decrement"
                  >
                    <MinusIcon className="size-5" />
                  </Button>
                  <Input className="w-24 text-center tabular-nums" />
                  <Button
                    className="absolute inset-y-0 right-2 z-10 text-neutral-600 hover:text-neutral-700"
                    slot="increment"
                  >
                    <PlusIcon className="size-5" />
                  </Button>
                </NumberFormField>
              )
            }
          </WatchState>
        </div>
      ))}
    </div>
  );
}
