import clsx from 'clsx';
import {
  Button as ButtonBase,
  ListBox,
  ListBoxItem,
  Tag,
  TagGroup,
  TagList,
  useDragAndDrop,
} from 'react-aria-components';
import {useFormContext} from 'react-hook-form';

import {XMarkIcon} from '@heroicons/react/24/outline';

import {ExpenseRow} from '@/api-types/components/schemas';
import Currency from '@/components/Currency.tsx';
import {Avatar} from '@/components/common';
import {useExpenseParticipants} from '@/components/modals/AddExpense/useExpenseParticipants.ts';

export default function ExpensesShares() {
  const {getValues, setValue} = useFormContext();

  const expenses: (ExpenseRow & {id: string})[] = (getValues('expenses') ?? []).map(
    (e: ExpenseRow, i: number) => ({
      ...e,
      id: `expenses.${i}`,
    })
  );

  const {dragAndDropHooks} = useDragAndDrop({
    async onItemDrop(e) {
      const items = await Promise.all(
        e.items.map(async (item, i) => {
          const name = item.kind === 'text' ? await item.getText('text/plain') : item.name;
          return {id: i, name};
        })
      );


      const participants = items.filter((item) => item.name.startsWith('urn:splinter:user'));
      for (const participant of participants) {
        const participantId = participant.name.split('/').at(-1);
        const shareKey = `${e.target.key}.shares.${participantId}`;
        const participantShare = getValues(shareKey) ?? 0;
        setValue(shareKey, participantShare + 1);
      }
    },
  });

  return (
    <div className="flex min-h-full grow flex-col gap-y-4">
      <ListBox
        items={expenses}
        aria-label="expense items"
        selectionMode="none"
        className="-mx-4 flex min-h-full grow flex-col gap-y-4 overflow-y-auto py-px focus:outline-none"
        dragAndDropHooks={dragAndDropHooks}
      >
        {(expense) => (
          <ListBoxItem
            textValue={expense.description}
            className="mx-4 rounded border border-neutral-200 bg-white px-3.5 py-3 focus:outline-none data-[drop-target]:bg-brand-100 data-[drop-target]:outline data-[drop-target]:outline-offset-[-1px] data-[drop-target]:outline-brand-400"
          >
            <div className="flex items-center justify-between">
              <div>{expense.description}</div>
              <Currency
                noColor
                value={expense.amount}
                className="text-neutral-600"
                currency="PKR"
              />
            </div>
            <div className="mt-4">
              <ExpenseItemShares expenseItem={expense} />
            </div>
          </ListBoxItem>
        )}
      </ListBox>

      <DraggableParticipants />
    </div>
  );
}

function ExpenseItemShares({expenseItem}: {expenseItem: ExpenseRow & {id: string}}) {
  const participants = useExpenseParticipants();
  const {watch, unregister} = useFormContext();

  const shares = watch(`${expenseItem.id}.shares`);
  const shareParticipants = participants
    .map((participant) => {
      if (!shares?.[participant.uid]) {
        return undefined;
      }

      return {share: shares[participant.uid], participant};
    })
    .filter(Boolean);

  if (shareParticipants.length === 0) {
    return <div className="py-[3px] text-sm italic text-neutral-500">Drop participant here</div>;
  }

  return (
    <TagGroup
      selectionMode="none"
      aria-label="expense item shares"
      onRemove={(keys) => {
        Array.from(keys).forEach((uid) => unregister(`${expenseItem.id}.shares.${uid}`, {keepValue: false}));
      }}
    >
      <TagList
        items={shareParticipants}
        className="react-aria-TagList flex flex-wrap items-center gap-2"
      >
        {(shareParticipant) => (
          <Tag
            id={shareParticipant.participant.uid}
            textValue={shareParticipant.participant.fullName}
            className="react-aria-Tag flex shrink-0 cursor-default items-center gap-x-2 overflow-hidden rounded-md border border-gray-300 text-sm text-neutral-700 focus:outline-none data-[focused]:border-brand-300 data-[focused]:bg-brand-100 [&[data-focused]_span]:bg-brand-100 [&[data-focused]_span]:ring-brand-300"
          >
            <Avatar
              className="size-6 rounded-none bg-neutral-50"
              fallback={shareParticipant.participant.fullName}
            />
            {shareParticipant.participant.fullName}
            <ButtonBase
              className="-ml-2 px-2 py-1 text-gray-500 focus:outline-none"
              slot="remove"
            >
              <XMarkIcon className="size-4" />
            </ButtonBase>
          </Tag>
        )}
      </TagList>
    </TagGroup>
  );
}

function DraggableParticipants() {
  const participants = useExpenseParticipants();

  const {dragAndDropHooks} = useDragAndDrop({
    renderDragPreview: (items) => (
      <div className="flex w-40 items-center justify-between gap-x-2 rounded bg-brand-600 px-2 py-1 text-sm text-white">
        <span className="truncate">
          {participants.find((p) => p.urn === items[0]['text/plain'])?.fullName}
        </span>
        <span className="inline-flex size-5 items-center justify-center rounded bg-white/20 text-xs font-medium">
          {items.length}
        </span>
      </div>
    ),
    getItems: (keys) =>
      [...keys].map((key) => ({
        'text/plain': key as string,
      })),
  });

  return (
    <ListBox
      aria-label="expense participants"
      selectionMode="multiple"
      className="flex shrink-0 flex-wrap gap-2"
      orientation="horizontal"
      items={participants}
      dragAndDropHooks={dragAndDropHooks}
      selectionBehavior="replace"
    >
      {(user) => (
        <ListBoxItem
          id={user.urn}
          textValue={user.fullName}
          className={clsx(
            'group flex shrink-0 cursor-default select-none items-center gap-x-2 overflow-hidden rounded-md border border-gray-300 pr-2 text-sm text-neutral-700 hover:bg-gray-100 focus:outline-none',
            'data-[focus-visible]:border-brand-500 data-[focused]:bg-neutral-100',
            'data-[selected]:border-brand-300 data-[selected]:bg-brand-100',
            'data-[focus-visible]:ring data-[focus-visible]:ring-brand-400/30'
          )}
        >
          <Avatar
            className={clsx(
              'size-6 rounded-none bg-neutral-50 group-hover:bg-neutral-100',
              'group-data-[focused]:bg-neutral-100 group-data-[focused]:ring-neutral-300',
              'group-data-[selected]:bg-brand-100 group-data-[selected]:ring-brand-300'
            )}
            fallback={user.fullName}
          />
          {user.fullName}
        </ListBoxItem>
      )}
    </ListBox>
  );
}
