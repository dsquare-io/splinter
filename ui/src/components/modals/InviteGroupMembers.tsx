import clsx from 'clsx';
import {
  Button as BaseButton,
  Button as ButtonBase,
  ComboBox,
  Dialog,
  Heading,
  ListBox,
  ListBoxItem,
  Modal,
  ModalOverlay,
  Popover,
  Tag,
  TagGroup,
  TagList,
} from 'react-aria-components';
import {useForm} from 'react-hook-form';

import {ChevronUpDownIcon, XMarkIcon} from '@heroicons/react/24/outline';

import {urlWithArgs} from '@/api-types';
import {Friend} from '@/api-types/components/schemas';
import {Paths} from '@/api-types/routePaths.ts';
import {Avatar, Button, Form, Input, Label} from '@/components/common';
import {CloseDialog} from '@/components/modals/utils.tsx';
import {apiQueryOptions, useApiQuery} from '@/hooks/useApiQuery.ts';
import {queryClient} from '@/queryClient.ts';

export function InviteGroupMembersModal({group_uid}: {group_uid: string}) {
  const formControl = useForm<{members: string[]}>({
    defaultValues: {members: []},
  });
  const selectedMembers = formControl.watch('members') ?? [];

  const {data: group} = useApiQuery(Paths.GROUP_DETAIL, {group_uid});
  const {data: friends} = useApiQuery(Paths.FRIEND_LIST);

  const friendsExcludingMembers = friends?.results?.filter(
    (f) => !group?.members.find((m) => m.uid === f.uid) && !selectedMembers.includes(f.uid)
  );

  function addMember(uid: string) {
    if (!selectedMembers.includes(uid) && uid) {
      formControl.setValue('members', [...selectedMembers, uid]);
    }
  }

  function removeMember(uid: string) {
    const selectedMembers = formControl.getValues('members') ?? [];
    if (selectedMembers.includes(uid)) {
      formControl.setValue(
        'members',
        selectedMembers.filter((m: string) => m !== uid)
      );
    }
  }

  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal max-h-[580px] sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full flex-col">
          {({close}) => (
            <>
              <div className="mb-6">
                <Heading slot="title">Invite Members</Heading>
                <p className="text-sm text-neutral-500">Invite your friends to share expenses in a group.</p>
                <CloseDialog />
              </div>

              <Form
                method="PUT"
                action={urlWithArgs(Paths.GROUP_MEMBERSHIP, {group_uid})}
                transformData={(data) => {
                  data.members = [...(data.members ?? []), ...(group?.members.map((m) => m.uid) ?? [])];
                  return data;
                }}
                onSubmitSuccess={() =>
                  queryClient.invalidateQueries(apiQueryOptions(Paths.GROUP_DETAIL, {group_uid})).then(close)
                }
                className="space-y-4"
                control={formControl}
              >
                <ComboBox
                  onSelectionChange={(val) => {
                    addMember(val as string);
                  }}
                  defaultItems={friendsExcludingMembers}
                  aria-label="friends"
                >
                  <Label slot={null}>Your Friends</Label>
                  <TagGroup
                    selectionMode="none"
                    aria-label="selected-friends"
                    onRemove={(keys) => {
                      Array.from(keys).forEach((uid) => removeMember(uid as string));
                    }}
                  >
                    <TagList
                      className={clsx(
                        'react-aria-TagList flex flex-wrap items-center gap-x-2 gap-y-1',
                        selectedMembers?.length > 0 && 'mb-4 mt-3'
                      )}
                      items={
                        selectedMembers
                          ?.map((uid) => friends?.results?.find((f) => f.uid === uid))
                          .filter(Boolean)
                          .map((f) => ({...f, id: f.uid})) ?? []
                      }
                    >
                      {(item) => (
                        <Tag
                          textValue={item.fullName}
                          className="react-aria-Tag flex shrink-0 cursor-default items-center gap-x-2 overflow-hidden rounded-md border border-gray-300 text-sm text-neutral-700 focus:outline-none data-[focused]:border-brand-300 data-[focused]:bg-brand-100 [&[data-focused]_span]:bg-brand-100 [&[data-focused]_span]:ring-brand-300"
                        >
                          <Avatar
                            className="size-6 rounded-none bg-neutral-50"
                            fallback={item.fullName}
                          />
                          {item.fullName}
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
                  <div className="relative">
                    <Input
                      placeholder="Search your friends..."
                      onKeyDown={() => {}}
                    />
                    <BaseButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </BaseButton>
                  </div>
                  <Popover className="react-aria-Popover w-[--trigger-width]">
                    <ListBox className="-mx-4 -my-2 text-gray-800">
                      {(friend: Friend) => (
                        <ListBoxItem
                          id={friend.uid}
                          className="flex cursor-default select-none items-center gap-x-3 px-4 py-1.5 outline-none hover:bg-gray-100"
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

                <div className="-mx-4 flex justify-between px-4 pt-4 sm:-mx-6 sm:px-6">
                  <Button type="submit">Invite to group</Button>
                </div>
              </Form>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
