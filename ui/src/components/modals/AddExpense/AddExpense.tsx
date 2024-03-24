import {Dialog, Heading, Modal, ModalOverlay} from 'react-aria-components';

import {Form} from '@/components/common';
import ExpenseItems from '@/components/modals/AddExpense/ExpenseInputList.tsx';
import ParticipantsSelector from '@/components/modals/AddExpense/ParticipantsSelector.tsx';
import {CloseDialog} from '@/components/modals/utils.tsx';

export default function AddExpense() {
  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal max-h-[580px] sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full flex-col">
          <div className="mb-6">
            <Heading slot="title">Add Expense</Heading>
            <CloseDialog />
          </div>
          <Form>
            <ParticipantsSelector />
            <ExpenseItems />
          </Form>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
