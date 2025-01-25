import clsx from 'clsx';
import {useEffect} from 'react';
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

import type {ChildExpense} from '@/api-types/components/schemas';
import {Paths} from '@/api-types/routePaths.ts';
import Currency from '@/components/Currency.tsx';
import {Avatar, FieldScope, useScopedFieldName} from '@/components/common';
import {useExpenseParticipants} from '@/components/modals/AddExpense/useExpenseParticipants.ts';
import {useApiQuery} from '@/hooks/useApiQuery.ts';

interface Props {
  onExpenseDetail?: (baseName: string) => void;
}

export default function ExpensesShares({onExpenseDetail}: Props) {
  const {getValues, setValue} = useFormContext();
  const {data: preferredCurrency} = useApiQuery(Paths.CURRENCY_PREFERENCE);

  const expenses: (ChildExpense & {id: string})[] = (getValues('expenses') ?? []).map(
    (e: ChildExpense, i: number) => ({
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
        const shareKey = `${e.target.key}.shares:to_dict__user__share.${participantId}`;
        const participantShare = getValues(shareKey) ?? 0;
        setValue(shareKey, participantShare + 1, {shouldDirty: true});
      }
    },
  });

  if (!preferredCurrency) return;

  return (
    <div className="flex min-h-full grow flex-col gap-y-4">
      <ListBox
        items={expenses}
        aria-label="expense items"
        selectionMode="none"
        className="-mx-4 flex min-h-full grow flex-col gap-y-4 overflow-y-auto py-px focus:outline-hidden"
        dragAndDropHooks={dragAndDropHooks}
      >
        {(expense) => (
          <ListBoxItem
            textValue={expense.description}
            className={clsx(
              'mx-4 rounded-sm border border-neutral-200 bg-white focus:outline-hidden',
              'cursor-pointer hover:border-brand-400 hover:bg-brand-50',
              'data-drop-target:bg-brand-100 data-drop-target:outline data-drop-target:outline-offset-[-1px] data-drop-target:outline-brand-400'
            )}
          >
            <div
              className="px-3.5 py-3"
              onClick={() => onExpenseDetail?.(expense.id)}
            >
              <div className="flex items-center justify-between">
                <div>{expense.description}</div>
                <Currency
                  noColor
                  noTabularNums
                  value={expense.amount}
                  className="text-neutral-600"
                  currency={preferredCurrency.uid}
                />
              </div>
              <div className="mt-4">
                <FieldScope name={`${expense.id}.shares:to_dict__user__share`}>
                  <ExpenseItemShares />
                </FieldScope>
              </div>
            </div>
          </ListBoxItem>
        )}
      </ListBox>

      <DraggableParticipants />
    </div>
  );
}

function ExpenseItemShares() {
  const participants = useExpenseParticipants();
  const {watch, formState, getFieldState, register, clearErrors, unregister} = useFormContext();

  const sharesFieldName = useScopedFieldName();

  const shares = watch(sharesFieldName);
  const shareParticipants = participants
    .map((participant) => {
      if (!shares?.[participant.uid]) {
        return undefined;
      }

      return {share: shares[participant.uid] as number, participant};
    })
    .filter(Boolean);

  useEffect(() => {
    if (!shares) {
      register(sharesFieldName, {
        validate: (val) => {
          if (!val || Object.keys(sharesFieldName).length === 0) {
            console.log({val});
            return "Shares can't be empty";
          }

          return undefined;
        },
      });
    }

    return () => clearErrors(sharesFieldName);
  }, [register, sharesFieldName]);

  const {invalid, error} = getFieldState(sharesFieldName, formState);

  if (invalid && shareParticipants.length === 0) {
    return <div className="py-[3px] text-sm text-red-600">{error?.message}</div>;
  }

  if (shareParticipants.length === 0) {
    return <div className="py-[3px] text-sm italic text-neutral-500">Drop participant here</div>;
  }

  return (
    <div
      className="inline-flex flex-wrap items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <TagGroup
        selectionMode="none"
        aria-label="expense item shares"
        className="contents"
        onRemove={(keys) => {
          Array.from(keys).forEach((uid) => unregister(`${sharesFieldName}.${uid}`, {keepValue: false}));
        }}
      >
        <TagList
          items={shareParticipants}
          className="react-aria-TagList contents"
        >
          {(shareParticipant) => (
            <Tag
              id={shareParticipant.participant.uid}
              textValue={shareParticipant.participant.fullName}
              className="react-aria-Tag flex shrink-0 cursor-default items-center gap-x-2 overflow-hidden rounded-md border border-gray-300 bg-white text-sm text-neutral-700 focus:outline-hidden data-focused:border-brand-300 data-focused:bg-brand-100 [&[data-focused]_span]:bg-brand-100 [&[data-focused]_span]:ring-brand-300"
            >
              <Avatar
                className="size-6 rounded-none bg-neutral-50"
                fallback={shareParticipant.participant.fullName}
              />
              {shareParticipant.participant.fullName}
              {shareParticipant.share > 1 && ` (${shareParticipant.share})`}
              <ButtonBase
                className="-ml-2 px-2 py-1 text-gray-500 focus:outline-hidden"
                slot="remove"
              >
                <XMarkIcon className="size-4" />
              </ButtonBase>
            </Tag>
          )}
        </TagList>
      </TagGroup>
    </div>
  );
}

function DraggableParticipants() {
  const participants = useExpenseParticipants();

  const {dragAndDropHooks} = useDragAndDrop({
    renderDragPreview: (items) => (
      <div className="flex w-40 items-center justify-between gap-x-2 rounded-sm bg-brand-600 px-2 py-1 text-sm text-white">
        <span className="truncate">
          {participants.find((p) => p.urn === items[0]['text/plain'])?.fullName}
        </span>
        <span className="inline-flex size-5 items-center justify-center rounded-sm bg-white/20 text-xs font-medium">
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
            'group flex shrink-0 cursor-default select-none items-center gap-x-2 overflow-hidden rounded-md border border-gray-300 pr-2 text-sm text-neutral-700 hover:bg-gray-100 focus:outline-hidden',
            'data-focus-visible:border-brand-500 data-focused:bg-neutral-100',
            'data-selected:border-brand-300 data-selected:bg-brand-100',
            'data-focus-visible:ring-3 data-focus-visible:ring-brand-400/30'
          )}
        >
          <Avatar
            className={clsx(
              'size-6 rounded-none bg-neutral-50 group-hover:bg-neutral-100',
              'group-data-focused:bg-neutral-100 group-data-focused:ring-neutral-300',
              'group-data-selected:bg-brand-100 group-data-selected:ring-brand-300'
            )}
            fallback={user.fullName}
          />
          {user.fullName}
        </ListBoxItem>
      )}
    </ListBox>
  );
}
