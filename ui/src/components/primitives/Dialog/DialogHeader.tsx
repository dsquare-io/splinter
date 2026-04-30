import { ReactNode } from 'react';
import { Heading } from 'react-aria-components';

import { CloseDialogButton } from '../Button';

type DialogHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
};

export function DialogHeader({ title, description }: DialogHeaderProps) {
  return (
    <div className="mb-6">
      <Heading slot="title">{title}</Heading>
      {description && <p className="text-sm text-neutral-500">{description}</p>}
      <CloseDialogButton />
    </div>
  );
}
