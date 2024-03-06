import {Dialog, Heading, Modal, ModalOverlay} from 'react-aria-components';

import {urlWithArgs} from '@/api-types';
import {Paths} from '@/api-types/routePaths.ts';
import {Avatar, Button, FieldError, Form, Input, Label, TextFormField} from '@/components/common';
import {CloseDialog} from '@/components/modals/utils.tsx';
import {apiQueryOptions, useApiQuery} from '@/hooks/useApiQuery.ts';
import {queryClient} from '@/queryClient.ts';

export function GroupSettingsModal({group_uid}: {group_uid: string}) {
  const {data: group} = useApiQuery(Paths.GROUP_DETAIL, {group_uid});

  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal max-h-[580px] sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full flex-col">
          {({close}) => (
            <>
              <div className="mb-4">
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
                      className="rounded-r-none focus:z-10 hover:z-10 relative"
                      placeholder="i.e., Trip, Homies"
                    />
                    <Button className="rounded-l-none" type="submit" variant="outline">Update</Button>
                  </div>
                  <FieldError />
                </TextFormField>
              </Form>

              <div className="mt-6">
                <label className="mb-1 block text-sm font-bold leading-relaxed text-gray-800">Members</label>
                <div>
                  {group?.members.map((memeber) => (
                    <div
                      key={memeber.uid}
                      className="flex items-center gap-x-4 py-2"
                    >
                      <Avatar
                        fallback={memeber.fullName}
                        className="size-9"
                      />
                      <div className="-space-y-0.5">
                        <div>{memeber.fullName}</div>
                        {!memeber.isActive && <div className="text-sm text-neutral-500">Inactive</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
