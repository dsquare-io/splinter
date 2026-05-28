import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { TextFormInput } from '@/components/form-controls';
import { UserSelectFormInput } from '@/components/form-controls/UserSelectFormInput.tsx';
import { Money } from '@/components/primitives';
import { useAuth } from '@/hooks/useAuth.ts';
import { useAttachmentsContext } from './AttachmentsContext.tsx';
import { AttachmentStrip } from './AttachmentStrip.tsx';
import { ExpenseInputList } from './ExpenseInputList.tsx';
import { useParticipantsContext } from './ExpenseParticipantsContext.tsx';
import { ParticipantsSelector } from './ParticipantsSelector.tsx';

export function ExpenseEntry() {
  const { currentUser } = useAuth();
  const { participants, hasPreselected } = useParticipantsContext();
  const { setValue } = useFormContext();
  const attachments = useAttachmentsContext();

  const currency = useWatch({ name: 'currency' }) as string | undefined;

  const expenses = useWatch({ name: 'expenses' });
  const isSimple = (expenses?.length ?? 0) <= 1;

  const descriptionValue = useWatch({ name: 'description' });
  useEffect(() => {
    if (isSimple) {
      setValue('expenses.0.description', descriptionValue ?? '');
    }
  }, [descriptionValue, isSimple, setValue]);

  const total = useMemo(
    () => (expenses ?? []).reduce((sum: number, e: any) => sum + (Number(e?.amount) || 0), 0),
    [expenses]
  );

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

      <TextFormInput
        name="description"
        label="Description"
        required={isSimple}
        maxLength={isSimple ? 32 : 64}
        autoFocus={hasPreselected && isSimple}
        placeholder={isSimple ? 'e.g. Dinner, Groceries' : 'e.g. Dinner at restaurant'}
      />

      {!isSimple && currency && (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>Total</span>
          <Money
            noColor
            noTabularNums
            value={total}
            currency={currency}
          />
        </div>
      )}

      <ExpenseInputList isSimple={isSimple} />

      <AttachmentStrip
        pendingAttachments={attachments.pendingAttachments}
        existingAttachments={attachments.existingAttachments}
        onAddFiles={attachments.addFiles}
        onRemovePending={attachments.removePending}
        onRemoveExisting={attachments.removeExisting}
        validationError={attachments.validationError}
        onClearError={attachments.clearValidationError}
      />
    </div>
  );
}
