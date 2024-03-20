import {Dialog, Heading, Modal, ModalOverlay} from 'react-aria-components';

import {Paths} from '@/api-types/routePaths.ts';
import { Button, FieldError, Form, FormRootErrors, Input, Label, TextFormField } from '@/components/common';
import {CloseDialog} from '@/components/modals/utils.tsx';
import {apiQueryOptions} from '@/hooks/useApiQuery.ts';
import {queryClient} from '@/queryClient.ts';

export function AddFriendModal() {
  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal max-h-[580px] sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full flex-col">
          {({close}) => (
            <>
              <div className="mb-6">
                <Heading slot="title">Add Friend</Heading>
                <p className="text-sm text-neutral-500">Invite friends using their email addresses</p>
                <CloseDialog />
              </div>

              <Form
                className="space-y-4"
                action={Paths.FRIEND_LIST}
                onSubmitSuccess={() =>
                  queryClient.invalidateQueries(apiQueryOptions(Paths.FRIEND_LIST)).then(close)
                }
                transformData={({email}: {email: string}) => {
                  return {
                    email,
                    name: email.split('@')[0],
                  };
                }}
              >
                <FormRootErrors />

                <TextFormField
                  required
                  name="email"
                  type="email"
                >
                  <Label>Email</Label>
                  <Input placeholder="Enter your friends email adress" />
                  <FieldError />
                </TextFormField>

                <div className="-mx-4 flex justify-between px-4 pt-4 sm:-mx-6 sm:px-6">
                  <Button type="submit">Invite Friend</Button>
                </div>
              </Form>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
