import { useWatch } from 'react-hook-form';

import { TextFormInput } from '@/components/form-controls';
import { UserSelectFormInput } from '@/components/form-controls/UserSelectFormInput.tsx';
import { useAuth } from '@/hooks/useAuth.ts';
import { ExpenseInputList } from './ExpenseInputList.tsx';
import { useParticipantsContext } from './ExpenseParticipantsContext.tsx';
import { ParticipantsSelector } from './ParticipantsSelector.tsx';

export function ExpenseEntry() {
  const { currentUser } = useAuth();
  const { participants } = useParticipantsContext();
  const expenses = useWatch({ name: 'expenses' });
  const isMulti = (expenses?.length ?? 0) > 1;

  return (
    <div className="space-y-4">
      <ParticipantsSelector />

      <UserSelectFormInput
        name="paidBy"
        defaultValue={currentUser?.uid}
        required
        label="Paid By"
        placeholder="Search participants..."
        items={participants}
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
