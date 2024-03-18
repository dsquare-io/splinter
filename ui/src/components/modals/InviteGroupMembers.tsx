import {Dialog, Heading, Modal, ModalOverlay} from 'react-aria-components';

import {FieldError, Form, Input, Label, TextFormField} from '@/components/common';
import {CloseDialog} from '@/components/modals/utils.tsx';

export function InviteGroupMembersModal({group_uid}: {group_uid: string}) {
  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal max-h-[580px] sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full flex-col">
          <div className="mb-4">
            <Heading slot="title">Invite Member</Heading>
            <CloseDialog />
          </div>

          <Form defaultValues={{group: group_uid, members: []}}>
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
          </Form>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
