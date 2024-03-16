import clsx from 'clsx';
import {useRef, useState} from 'react';
import {
  Button as ButtonBase,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
  Popover,
  Tag,
  TagGroup,
  TagList,
} from 'react-aria-components';

import {CheckIcon, ChevronDownIcon, XMarkIcon} from '@heroicons/react/24/outline';
import {useQuery} from '@tanstack/react-query';
import {useNavigate} from '@tanstack/react-router';
import {AxiosResponse} from 'axios';

import {ApiResponse, urlWithArgs} from '@/api-types';
import {Friend} from '@/api-types/components/schemas';
import {Paths} from '@/api-types/routePaths.ts';
import {axiosInstance} from '@/axios.ts';
import {Avatar, Button, FieldError, Form, Input, Label, TextFormField} from '@/components/common';
import {Command, CommandEmpty, CommandInput, CommandItem, CommandList} from '@/components/common/Command';
import {CloseDialog} from '@/components/modals/utils.tsx';
import {apiQueryOptions, useApiQuery} from '@/hooks/useApiQuery.ts';
import {queryClient} from '@/queryClient.ts';

export function CreateGroupModal({group_uid}: {group_uid?: string}) {
  const {data} = useQuery(
    apiQueryOptions(Paths.GROUP_DETAIL, {group_uid: group_uid ?? ''}, undefined, {
      enabled: !!group_uid,
    })
  );
  const {data: friends} = useApiQuery(Paths.FRIEND_LIST);
  const {data: profileData} = useApiQuery(Paths.PROFILE);

  const navigate = useNavigate();
  const [isOpen, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const selectedFriendIds = selectedFriends.map((e) => e.uid);

  async function handleFormSubmissionSuccess(
    res: AxiosResponse<ApiResponse<typeof Paths.GROUP_LIST, 'post', 201>>
  ) {
    return axiosInstance
      .post(urlWithArgs(Paths.SYNC_GROUP_MEMBERSHIP, {group_uid: res.data.uid!}), {
        members: [...selectedFriends.map((f) => f.uid), profileData?.uid],
      })
      .then(() =>
        navigate({
          to: `/groups/$group`,
          params: {group: res.data.uid!},
        })
      )
      .then(() => queryClient.invalidateQueries(apiQueryOptions(Paths.GROUP_LIST)));
  }

  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal max-h-[580px] sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full flex-col">
          {({close}) => (
            <>
              <div className="mb-6">
                <Heading slot="title">Create Group</Heading>
                <p className="text-sm text-neutral-500">Group expenses for better visibility</p>
                <CloseDialog />
              </div>

              <Form
                values={{name: data?.name}}
                method={'POST'}
                action={group_uid ? Paths.GROUP_DETAIL : Paths.GROUP_LIST}
                onSubmitSuccess={(res) => handleFormSubmissionSuccess(res!).then(close)}
                className="space-y-4"
              >
                <TextFormField
                  required
                  name="name"
                >
                  <Label>Group Name</Label>
                  <Input
                    type="text"
                    placeholder="i.e., Trip, Homies"
                  />
                  <FieldError />
                </TextFormField>

                <div className="react-aria-TextField">
                  <label className="mb-1 block text-sm font-bold leading-relaxed text-gray-800">
                    Members
                  </label>
                  <div
                    ref={triggerRef}
                    onClick={() => setOpen((o) => !o)}
                    className="relative flex w-full min-w-0 flex-1 items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-[8px] text-left text-sm text-gray-500 outline outline-0 transition-colors duration-75 hover:border-gray-400 focus:outline-none"
                  >
                    <div
                      className="contents"
                      onClick={(e) => selectedFriends.length > 0 && e.stopPropagation()}
                    >
                      <TagGroup
                        selectionMode="none"
                        className="react-aria-TagGroup flex flex-wrap items-center gap-x-2 gap-y-1"
                        onRemove={(keys) => {
                          setSelectedFriends((frids) => frids.filter((e) => !keys.has(e.uid)));
                        }}
                      >
                        <TagList
                          items={selectedFriends.map((e) => ({id: e.uid, ...e}))}
                          className="react-aria-TagList contents"
                          renderEmptyState={() => <span className="cursor-default">Select friends...</span>}
                        >
                          {(item: Friend) => (
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
                    </div>

                    <button
                      type="button"
                      className="focus:outline-none"
                    >
                      <ChevronDownIcon className="size-4 text-gray-500" />
                    </button>
                  </div>
                  <Popover
                    isOpen={isOpen}
                    onOpenChange={setOpen}
                    triggerRef={triggerRef}
                    className="react-aria-Popover p-0"
                  >
                    <Dialog className="h-full focus:outline-none">
                      <Command>
                        <CommandInput placeholder="Search Friends..." />
                        <CommandEmpty>No Friends found</CommandEmpty>
                        <CommandList>
                          {friends?.results?.map((friend) => (
                            <CommandItem
                              key={friend.uid}
                              value={friend.uid}
                              onSelect={(currentId) => {
                                setSelectedFriends((currentFriends) => {
                                  const currentFriendsIds = currentFriends.map((e) => e.uid);
                                  if (currentFriendsIds.includes(currentId)) {
                                    currentFriends = currentFriends.filter((e) => e.uid !== currentId);
                                  } else {
                                    currentFriends.push(friend);
                                  }
                                  return [...currentFriends];
                                });
                              }}
                              className="gap-x-4 px-4"
                            >
                              <Avatar
                                className="size-8 bg-neutral-50"
                                fallback={friend.fullName}
                              />
                              {friend.fullName}
                              <CheckIcon
                                className={clsx(
                                  'ml-auto h-4 w-4',
                                  selectedFriendIds.includes(friend.uid) ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </Dialog>
                  </Popover>
                </div>

                <div className="-mx-4 flex justify-between px-4 pt-4 sm:-mx-6 sm:px-6">
                  <Button type="submit">Create Group</Button>
                </div>
              </Form>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
