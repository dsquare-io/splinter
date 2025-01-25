import {Button as BaseButton, ComboBox, ListBox, ListBoxItem, Popover} from 'react-aria-components';

import {ChevronRightIcon} from '@heroicons/react/20/solid';
import {ChevronUpDownIcon} from '@heroicons/react/24/outline';

import {SimpleUser} from '@/api-types/components/schemas';
import {Avatar, Button, Input, Label} from '@/components/common';
import {FormField} from '@/components/common/Form/FormField.tsx';

import ExpenseInputList from './ExpenseInputList.tsx';
import ParticipantsSelector from './ParticipantsSelector.tsx';
import {useExpenseParticipants} from './useExpenseParticipants.ts';
import {useApiQuery} from '../../../hooks/useApiQuery.ts';
import {Paths} from '../../../api-types/routePaths.ts';

interface Props {
  onNext?: () => void;
}

export default function ExpenseEntry({onNext}: Props) {
  const participants = useExpenseParticipants();
  const {data: profile} = useApiQuery(Paths.PROFILE);

  return (
    <>
      <div className="grow space-y-4">
        <ParticipantsSelector />

        <FormField name="paidBy" defaultValue={profile?.uid}>
          <ComboBox defaultItems={participants}>
            <Label>Paid By</Label>
            <div className="relative">
              <Input placeholder="Search your friends..." />
              <BaseButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </BaseButton>
            </div>
            <Popover className="react-aria-Popover w-(--trigger-width)">
              <ListBox className="-mx-4 -my-2 text-gray-800">
                {(friend: SimpleUser) => (
                  <ListBoxItem
                    id={friend.uid}
                    className="flex cursor-default select-none items-center gap-x-3 px-4 py-1.5 outline-hidden hover:bg-gray-100"
                    textValue={friend.fullName}
                  >
                    <Avatar
                      className="size-7 bg-neutral-50"
                      fallback={friend.fullName}
                    />
                    {friend.fullName}
                  </ListBoxItem>
                )}
              </ListBox>
            </Popover>
          </ComboBox>
        </FormField>

        <ExpenseInputList />
      </div>
      <div className="-mx-4 mt-4 flex justify-end px-4 pt-2 sm:-mx-6 sm:px-6">
        <Button
          slot={null}
          onPress={onNext}
        >
          Next
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </>
  );
}
