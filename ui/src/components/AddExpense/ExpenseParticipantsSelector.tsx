import {Label, Button as RACButton, Tag, TagGroup, TagList} from 'react-aria-components';
import {useDispatch, useSelector} from 'react-redux';

import {Avatar} from '@components/common';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {Command} from 'cmdk';

import {ApiRoutes} from '@/api-types';
import {useApiQuery} from '@/hooks/useApiQuery.ts';
import {addParticipant, removeParticipants, toggleSearchActive} from '@/store';

function ExpenseParticipantList() {
  const {data: friendsData} = useApiQuery(ApiRoutes.FRIEND_LIST);
  const {data: groupsData} = useApiQuery(ApiRoutes.GROUP_LIST);

  const selectedParticipants = useSelector((state) => state.addExpense.participants);
  const isParticipantsSearchActive = useSelector((state) => state.addExpense.isParticipantsSearchActive);
  const dispatch = useDispatch();

  const selectedKeys = selectedParticipants.map((e) => e.id);
  const hasGroups = (groupsData?.results?.filter((e) => !selectedKeys.includes(e.publicId!)).length ?? 0) > 0;
  const hasFriends = (friendsData?.results?.filter((e) => !selectedKeys.includes(e.uid)).length ?? 0) > 0;

  const participantList = (
    <Command.List className="-mx-4 flex-1 overflow-y-auto py-4 sm:-mx-6">
      {hasGroups && (
        <Command.Group
          heading="Groups"
          className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-600 [&_[cmdk-group-heading]]:sm:px-6"
        >
          {groupsData?.results
            ?.filter((e) => !selectedKeys.includes(e.publicId!))
            ?.map((group) => (
              <Command.Item
                onSelect={() => {
                  dispatch(addParticipant({id: group.publicId!, type: 'group', name: group.name}));
                  dispatch(toggleSearchActive(false))
                }}
                key={group.publicId!}
                tabIndex={-1}
                className="flex cursor-default items-center gap-x-4 px-4 py-2 text-neutral-900 transition-colors duration-75 data-[selected]:bg-gray-100 sm:px-6"
              >
                <Avatar
                  className="size-8 bg-neutral-50"
                  fallback={group.name}
                />
                {group.name}
              </Command.Item>
            ))}
        </Command.Group>
      )}

      {hasGroups && hasFriends && <Command.Separator className="mb-0.5 mt-2 h-px bg-neutral-100" />}

      {hasFriends && (
        <Command.Group
          heading="Friends"
          className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-600 [&_[cmdk-group-heading]]:sm:px-6"
        >
          {friendsData?.results
            ?.filter((e) => !selectedKeys.includes(e.uid))
            ?.map((friend) => (
              <Command.Item
                onSelect={() => {
                  dispatch(addParticipant({id: friend.uid, type: 'friend', name: friend.name}));
                  dispatch(toggleSearchActive(false))
                }}
                tabIndex={-1}
                key={friend.uid}
                className="flex cursor-default items-center gap-x-4 px-4 py-2 text-neutral-900 transition-colors duration-75 data-[selected]:bg-gray-100 sm:px-6"
              >
                <Avatar
                  className="size-8 bg-neutral-50"
                  fallback={friend.name}
                />
                {friend.name}
              </Command.Item>
            ))}
        </Command.Group>
      )}
    </Command.List>
  );

  if (selectedKeys.length === 0) {
    return participantList;
  }

  if (!isParticipantsSearchActive || (!hasGroups && !hasFriends)) {
    return null;
  }

  return (
    <div className="react-aria-Popover animate-in slide-in-from-bottom-1 fade-in absolute z-20 mt-1 flex max-h-[300px] w-full max-w-[calc(theme(maxWidth.lg)-48px)] flex-col rounded-md border border-neutral-300 bg-white px-4 shadow-md sm:px-6">
      {participantList}
    </div>
  );
}

export default function ExpenseParticipantsSelector() {
  const dispatch = useDispatch();
  const selectedParticipants = useSelector((state) => state.addExpense.participants);

  return (
    <Command
      className={selectedParticipants.length > 0 ? 'relative' : 'contents'}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          dispatch(toggleSearchActive(false))
        }
      }}
    >
      <TagGroup
        selectionMode="none"
        className="react-aria-TagGroup -mx-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-t border-neutral-300 px-4 py-2 sm:-mx-6 sm:px-6"
        onRemove={(keys) => {
          dispatch(removeParticipants(Array.from(keys) as string[]));
        }}
      >
        <Label className="shrink-0 text-sm text-gray-600">With you and:</Label>
        <TagList
          items={selectedParticipants}
          className="react-aria-TagList contents"
        >
          {(item) => (
            <Tag
              textValue={item.name}
              className="react-aria-Tag flex shrink-0 cursor-default items-center gap-x-2 overflow-hidden rounded-md border border-gray-300 text-sm text-neutral-700 focus:outline-none data-[focused]:border-brand-300 data-[focused]:bg-brand-100 [&[data-focused]_span]:bg-brand-100 [&[data-focused]_span]:ring-brand-300"
            >
              <Avatar
                className="size-6 rounded-none bg-neutral-50"
                fallback={item.name}
              />
              {item.name}
              <RACButton
                className="-ml-2 px-2 py-1 text-neutral-800 focus:outline-none"
                slot="remove"
              >
                <XMarkIcon className="size-4" />
              </RACButton>
            </Tag>
          )}
        </TagList>

        <Command.Input
          placeholder="Search friends or groups..."
          onFocus={() => dispatch(toggleSearchActive(true))}
          onInput={() => dispatch(toggleSearchActive(true))}
          className="-my-1 min-w-[100px] grow py-1.5 focus:outline-none"
        />
      </TagGroup>

      <ExpenseParticipantList />
    </Command>
  );
}
