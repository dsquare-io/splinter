import {useContext} from 'react';
import {
  Button,
  Dialog,
  Heading,
  Label,
  Modal,
  ModalOverlay,
  OverlayTriggerStateContext,
  Tag,
  TagGroup,
  TagList,
} from 'react-aria-components';
import {ListData, useListData} from 'react-stately';

import {Avatar} from '@components/common';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {Command} from 'cmdk';

import {ApiRoutes} from '@/api-types';
import {useApiQuery} from '@/hooks/useApiQuery.ts';

function CloseButton() {
  const state = useContext(OverlayTriggerStateContext)!;

  return (
    <button
      onClick={() => state.close()}
      className="focus:ring-ring absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
    >
      <XMarkIcon className="size-5" />
    </button>
  );
}

function ExpenseParties({selectedItems}: {selectedItems: ListData<any>}) {
  const {data: friendsData} = useApiQuery(ApiRoutes.FRIEND_LIST);
  const {data: groupsData} = useApiQuery(ApiRoutes.GROUP_LIST);

  const selectedKeys = selectedItems.items.map((e) => e.id);

  const hasGroups = (groupsData?.results?.filter((e) => !selectedKeys.includes(e.publicId)).length ?? 0) > 0;
  const hasFriends = (friendsData?.results?.filter((e) => !selectedKeys.includes(e.uid)).length ?? 0) > 0;

  return (
    <Command.List className="-mx-4 overflow-y-auto sm:-mx-6">
      {hasGroups && (
        <Command.Group
          heading="Groups"
          className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-600 [&_[cmdk-group-heading]]:sm:px-6"
        >
          {groupsData?.results
            ?.filter((e) => !selectedKeys.includes(e.publicId))
            ?.map((group) => (
              <Command.Item
                onSelect={() => {
                  selectedItems.append({id: group.publicId, type: 'group', name: group.name});
                }}
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
                  selectedItems.append({id: friend.uid, type: 'friend', name: friend.name});
                }}
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
}

export function AddExpense() {
  const selectedItems = useListData<any>({initialItems: []});

  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal sm:max-w-xl">
        <Dialog>
          <div>
            <Heading slot="title">Add Expense</Heading>
            <CloseButton />
          </div>

          <Command>
            <TagGroup
              selectionMode="none"
              className="react-aria-TagGroup -mx-4 my-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-t border-neutral-300 px-4 py-2 sm:-mx-6 sm:px-6"
              onRemove={(keys) => {
                selectedItems.remove(...keys);
              }}
            >
              <Label className="shrink-0 text-sm text-gray-600">With you and:</Label>

              <TagList
                items={selectedItems.items}
                className="react-aria-TagList contents"
              >
                {(item) => (
                  <Tag className="react-aria-Tag flex shrink-0 cursor-default items-center gap-x-2 overflow-hidden rounded-md border border-gray-300 text-sm text-neutral-700 focus:outline-none data-[focused]:border-brand-300 data-[focused]:bg-brand-100 [&[data-focused]_span]:bg-brand-100 [&[data-focused]_span]:ring-brand-300">
                    <Avatar
                      className="size-6 rounded-none bg-neutral-50"
                      fallback={item.name}
                    />
                    {item.name}
                    <Button
                      className="-ml-2 px-2 py-1 text-neutral-800 focus:outline-none"
                      slot="remove"
                    >
                      <XMarkIcon className="size-4" />
                    </Button>
                  </Tag>
                )}
              </TagList>

              <Command.Input
                placeholder="Search friends or groups..."
                className="-my-1 min-w-[100px] grow py-1.5 focus:outline-none"
              />
            </TagGroup>

            <ExpenseParties selectedItems={selectedItems} />
          </Command>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
