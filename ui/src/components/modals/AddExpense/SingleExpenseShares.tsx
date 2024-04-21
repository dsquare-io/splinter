import {Button} from 'react-aria-components';
import {useFormContext} from 'react-hook-form';

import {MinusIcon, PlusIcon} from '@heroicons/react/24/outline';

import {Avatar, Checkbox, Input, NumberFormField, WatchState, useScopedFieldName} from '@/components/common';

import {useExpenseParticipants} from './useExpenseParticipants';

export function SingleExpenseShares() {
  const participants = useExpenseParticipants();
  const {setValue, getValues} = useFormContext();
  const sharesBaseName = useScopedFieldName('shares:to_dict__user__share');

  return (
    <div className="-mx-4 grid grid-cols-[1fr_auto] divide-y divide-neutral-100 overflow-y-auto sm:-mx-6">
      <div className="px-4 sm:px-6">
        <Checkbox
          shape="circle"
          className="flex gap-x-3 py-2 text-sm text-neutral-800"
          onChange={(checked) => {
            for (const user of participants) {
              const key = [sharesBaseName, user.uid].join('.');
              const currentValue = getValues(key);
              setValue(key, checked ? (currentValue || 1) : 0);
            }
          }}
        >
          All
        </Checkbox>
      </div>
      {participants.map((user) => (
        <div
          key={user.urn}
          className="col-span-3 grid grid-cols-subgrid items-center gap-x-3 px-4 py-1.5 sm:px-6"
        >
          <div>
            <WatchState name={`shares:to_dict__user__share.${user.uid}`}>
              {(shares) => {
                return (
                  <Checkbox
                    shape="circle"
                    className="gap-x-3 py-2"
                    isSelected={shares > 0}
                    onChange={(checked) => {
                      if (checked) {
                        setValue([sharesBaseName, user.uid].join('.'), 1);
                      } else {
                        setValue([sharesBaseName, user.uid].join('.'), 0);
                      }
                    }}
                  >
                    <div className="flex items-center gap-x-2">
                      <Avatar fallback={user.fullName} />
                      <div className="text-neutral-800">{user.fullName}</div>
                    </div>
                  </Checkbox>
                );
              }}
            </WatchState>
          </div>

          <WatchState name={`shares:to_dict__user__share.${user.uid}`}>
            {(shares) =>
              shares > 0 && (
                <NumberFormField
                  className="relative"
                  aria-label="share"
                  defaultValue={1}
                  name={`shares:to_dict__user__share.${user.uid}`}
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
