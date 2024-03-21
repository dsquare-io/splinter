import {Dialog, Heading, Modal, ModalOverlay} from 'react-aria-components';

import {ArrowRightStartOnRectangleIcon, TrashIcon, XMarkIcon} from '@heroicons/react/24/outline';
import {useQuery} from '@tanstack/react-query';
import {useNavigate} from '@tanstack/react-router';
import groupBy from 'just-group-by';

import {urlWithArgs} from '@/api-types';
import {Paths} from '@/api-types/routePaths.ts';
import {axiosInstance} from '@/axios.ts';
import {Avatar, Button, FieldError, Form, Input, Label, TextFormField} from '@/components/common';
import {CloseDialog} from '@/components/modals/utils.tsx';
import {apiQueryOptions, useApiQuery} from '@/hooks/useApiQuery.ts';
import {useConfirmation} from '@/hooks/useConfirmation.tsx';
import {queryClient} from '@/queryClient.ts';

export function GroupSettingsModal({group_uid}: {group_uid: string}) {
  const confirm = useConfirmation();
  const navigate = useNavigate();

  const {data: profileData} = useApiQuery(Paths.PROFILE);
  const {data: group} = useApiQuery(Paths.GROUP_DETAIL, {group_uid});

  const {data: groupData} = useQuery(
    apiQueryOptions(Paths.GROUP_DETAIL, {group_uid: group_uid ?? ''}, undefined, {
      enabled: !!group_uid,
    })
  );
  let balanceByUsers = groupBy(groupData?.outstandingBalances ?? [], (balance) => balance.user.uid);
  balanceByUsers = Object.fromEntries(
    Object.entries(balanceByUsers).map(([uId, balances]) => [uId, balances])
  );

  async function removeMember(member: {uid: string; fullName?: string}) {
    return confirm({
      title: 'Remove Member',
      description: (
        <>
          Are you sure you want to remove <span className="font-medium text-gray-800">{member.fullName}</span>{' '}
          from this group? This action cannot be undone.
        </>
      ),
      callback: async () => {
        await axiosInstance.delete(
          urlWithArgs(Paths.GROUP_MEMBERSHIP_DETAIL, {
            group_uid,
            member_uid: member.uid,
          })
        );
        return queryClient.invalidateQueries(apiQueryOptions(Paths.GROUP_DETAIL, {group_uid}));
      },
    });
  }

  async function deleteGroup() {
    return confirm({
      title: 'Delete Group',
      description: (
        <>
          Are you sure you want to delete <span className="font-medium text-gray-800">{group?.name}</span>{' '}
          group? This action cannot be undone.
        </>
      ),
      callback: async () => {
        await axiosInstance.delete(
          urlWithArgs(Paths.GROUP_DETAIL, {
            group_uid,
          })
        );
        await queryClient.invalidateQueries(apiQueryOptions(Paths.GROUP_LIST));
        return navigate({to: '/groups'});
      },
    });
  }

  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal max-h-[580px] overflow-y-auto sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full flex-col">
          {({close}) => (
            <>
              <div className="mb-6">
                <Heading slot="title">Group Settings</Heading>
                <CloseDialog />
              </div>

              <Form
                values={{name: group?.name}}
                method="PATCH"
                action={urlWithArgs(Paths.GROUP_DETAIL, {group_uid})}
                onSubmitSuccess={() =>
                  queryClient.invalidateQueries(apiQueryOptions(Paths.GROUP_DETAIL, {group_uid})).then(close)
                }
              >
                <TextFormField
                  required
                  name="name"
                >
                  <Label>Group Name</Label>
                  <div className="flex items-center -space-x-px">
                    <Input
                      type="text"
                      className="relative rounded-r-none hover:z-10 focus:z-10"
                      placeholder="i.e., Trip, Homies"
                    />
                    <Button
                      className="rounded-l-none"
                      type="submit"
                      variant="outline"
                    >
                      Update
                    </Button>
                  </div>
                  <FieldError />
                </TextFormField>
              </Form>

              <section className="mt-6">
                <h2 className="block text-sm font-bold leading-relaxed text-gray-800">Group Members</h2>
                <p className="mb-2 text-sm text-neutral-500">
                  Members with outstanding balances can't be remove from group
                </p>
                <div>
                  {group?.members.map((memeber) => (
                    <div
                      key={memeber.uid}
                      className="flex items-center gap-x-3 py-2"
                    >
                      <Avatar
                        fallback={memeber.fullName}
                        className="size-8"
                      />
                      <div className="flex-1 -space-y-0.5 text-neutral-800">
                        <div>{memeber.fullName}</div>
                        {!memeber.isActive && <div className="text-sm text-neutral-500">Inactive</div>}
                      </div>
                      {!balanceByUsers[memeber.uid]?.length && (
                        <button
                          type="button"
                          className="focus:ring-ring rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                          onClick={() => removeMember(memeber)}
                        >
                          <XMarkIcon className="size-4 text-neutral-800" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-6">
                <h2 className="mb-2 block text-sm font-bold leading-relaxed text-gray-800">Group Settings</h2>
                <div className="-mx-2">
                  <button
                    disabled={!!balanceByUsers[profileData?.uid ?? '']?.length}
                    type="button"
                    onClick={() => profileData && removeMember(profileData)}
                    className="flex w-full items-center gap-x-3 rounded px-2 py-2.5 hover:bg-gray-50 focus:outline-none disabled:opacity-60 disabled:hover:bg-transparent"
                  >
                    <ArrowRightStartOnRectangleIcon className="size-8 p-1.5 text-neutral-700" />
                    <div className="text-left">
                      <div className="text-gray-800">Leave Group</div>
                      {!!balanceByUsers[profileData?.uid ?? '']?.length && (
                        <div className="text-xs text-neutral-600">
                          Please settle up your outstanding balances first.
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-x-3 rounded px-2 py-2.5 text-red-700 hover:bg-red-50 focus:outline-none"
                    onClick={deleteGroup}
                  >
                    <TrashIcon className="size-8 p-1.5 text-red-700" />
                    <div>Delete Group</div>
                  </button>
                </div>
              </section>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
