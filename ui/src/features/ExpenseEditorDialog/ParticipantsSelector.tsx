import { useEffect, useRef, useState } from 'react';
import {
  Button as BaseButton,
  Collection,
  ComboBox,
  Header,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
} from 'react-aria-components';
import { useFormContext } from 'react-hook-form';

import { ChevronDownIcon } from '@heroicons/react/24/outline';

import { ApiRoutes } from '@/api-types';
import { Friend, Group } from '@/api-types/components/schemas';
import { Avatar, SelectValue, type SelectItemRenderProps } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { useParticipantsContext } from './ExpenseParticipantsContext.tsx';

function ParticipantTag({ item }: SelectItemRenderProps<Friend | Group>) {
  return (
    <>
      <Avatar
        className="size-6 rounded-none bg-neutral-50"
        fallback={item.name}
      />
      {item.name}
    </>
  );
}

export function ParticipantsSelector() {
  const { setValue } = useFormContext();
  const { selected, hasPreselected, groupLocked, dispatch } = useParticipantsContext();
  const triggerRef = useRef<HTMLDivElement>(null);
  const { data: groups } = useApiQuery(ApiRoutes.GROUP_LIST);
  const { data: friends } = useApiQuery(ApiRoutes.FRIEND_LIST);
  const [inputValue, setInputValue] = useState('');
  const skipNextInputChange = useRef(false);

  useEffect(() => {
    if (selected[0]?.type === 'group') {
      setValue('group', selected[0].uid);
    } else {
      setValue('group', undefined);
    }
  }, [selected, setValue]);

  if (groupLocked) {
    return (
      <div className="-mx-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-neutral-300 px-4 py-2 sm:-mx-6 sm:px-6">
        <span className="shrink-0 text-sm text-gray-600">With you and:</span>
        {selected.map((p) => (
          <span
            key={p.urn}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-800"
          >
            <Avatar
              className="size-6 rounded-none bg-neutral-50"
              fallback={p.name}
            />
            {p.name}
          </span>
        ))}
      </div>
    );
  }

  if (!groups || !friends) return null;

  const allItems: (Friend | Group)[] = [...groups, ...friends];
  const selectedUrns = selected.map((p) => p.urn);

  const filteredSections = [
    {
      name: 'Groups',
      children: groups.filter((g) => g.name.toLowerCase().includes(inputValue.toLowerCase())),
    },
    {
      name: 'Friends',
      children: friends.filter((f) => f.name.toLowerCase().includes(inputValue.toLowerCase())),
    },
  ].filter((s) => s.children.length > 0);

  return (
    <div
      ref={triggerRef}
      className="-mx-4 border-y border-neutral-300 px-4 py-2 sm:-mx-6 sm:px-6"
    >
      <ComboBox
        selectionMode="multiple"
        value={selectedUrns}
        onChange={(keys) => {
          if (!Array.isArray(keys)) return;
          const newUrns = keys as string[];
          const addedUrns = newUrns.filter((u) => !selectedUrns.includes(u));
          const removedUrns = selectedUrns.filter((u) => !newUrns.includes(u));

          for (const urn of addedUrns) {
            const friend = friends.find((f) => f.urn === urn);
            const group = groups.find((g) => g.urn === urn);
            if (friend) dispatch({ type: 'select_friend', data: friend });
            else if (group) dispatch({ type: 'select_group', data: group });
          }
          for (const urn of removedUrns) {
            dispatch({ type: 'remove', urn });
          }

          if (addedUrns.length > 0) {
            skipNextInputChange.current = true;
            setInputValue('');
          }
        }}
        items={allItems}
        className="flex flex-wrap items-center gap-x-2 gap-y-1"
        aria-label="participants"
        allowsEmptyCollection
        inputValue={inputValue}
        onInputChange={(val) => {
          if (skipNextInputChange.current) {
            skipNextInputChange.current = false;
            return;
          }
          setInputValue(val);
        }}
      >
        <Label className="shrink-0 text-sm text-gray-600">With you and:</Label>
        <SelectValue<Friend | Group>
          idPropName="urn"
          textValuePropName="name"
          ItemComponent={ParticipantTag}
        />
        <div className="-my-1 flex min-w-25 grow items-center">
          <Input
            autoFocus={!hasPreselected}
            placeholder="Search friends or groups..."
            className="grow py-1.5 focus:outline-hidden"
          />
          <BaseButton className="flex items-center rounded-r-md py-2.5 focus:outline-hidden">
            <ChevronDownIcon
              className="size-4 text-gray-500"
              aria-hidden="true"
            />
          </BaseButton>
        </div>
        <Popover
          crossOffset={16}
          triggerRef={triggerRef}
          className="react-aria-Popover w-[min(464px,100vw)]"
        >
          <ListBox
            className="react-aria-ListBox -mx-3 -my-4"
            items={filteredSections}
          >
            {(section) => (
              <ListBoxSection id={section.name}>
                <Header>{section.name}</Header>
                <Collection items={section.children as (Friend | Group)[]}>
                  {(item) => (
                    <ListBoxItem
                      id={item.urn}
                      textValue={item.name}
                    >
                      <Avatar
                        className="size-7 bg-neutral-50"
                        fallback={item.name}
                      />
                      {item.name}
                    </ListBoxItem>
                  )}
                </Collection>
              </ListBoxSection>
            )}
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  );
}
