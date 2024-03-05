import {Dialog, Heading, Modal, ModalOverlay} from 'react-aria-components';

import {Paths} from '@/api-types/routePaths.ts';
import {Form} from '@/components/common';
import {CloseDialog} from '@/components/modals/utils.tsx';

export function InviteGroupMembersModal({group_uuid}: {group_uuid: string}) {
  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal h-[--visual-viewport-height] max-h-[580px] sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full flex-col">
          <div className="mb-4">
            <Heading slot="title">Invite Member</Heading>
            <CloseDialog />
          </div>

          <Form
            defaultValues={{group: group_uuid, members: []}}
            action={Paths.BULK_GROUP_MEMBERSHIP}
          ></Form>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
