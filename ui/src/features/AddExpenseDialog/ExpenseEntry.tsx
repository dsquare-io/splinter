import { useWatch } from 'react-hook-form';

import { SelectFormInput, TextFormInput } from '@/components/form-controls';
import { Avatar, type SelectItemRenderProps } from '@/components/primitives';
import { useAuth } from '@/hooks/useAuth.ts';
import { ExpenseInputList } from './ExpenseInputList.tsx';
import { Participant, useParticipantsContext } from './ExpenseParticipantsContext.tsx';
import { ParticipantsSelector } from './ParticipantsSelector.tsx';

function ParticipantItem({ item }: SelectItemRenderProps<Participant>) {
  return (
    <>
      <Avatar
        className="size-7 bg-neutral-50"
        fallback={item.initials || item.name}
      />
      {item.name}
    </>
  );
}

export function ExpenseEntry() {
  const { currentUser } = useAuth();
  const { participants } = useParticipantsContext();
  const expenses = useWatch({ name: 'expenses' });
  const isMulti = (expenses?.length ?? 0) > 1;

  return (
    <div className="space-y-4">
      <ParticipantsSelector />

      <SelectFormInput
        name="paidBy"
        defaultValue={currentUser?.uid}
        required
        label="Paid By"
        placeholder="Search participants..."
        items={participants}
        ItemComponent={ParticipantItem}
      />

      {isMulti && (
        <TextFormInput
          name="description"
          label="Description"
          placeholder="e.g. Dinner at restaurant"
        />
      )}

      <ExpenseInputList />
    </div>
  );
}
