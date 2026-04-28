import { useEffect, useRef, useState } from 'react';

import { createFileRoute, useNavigate } from '@tanstack/react-router';

import ExpenseDetail from '@/components/modals/ExpenseDetail';

export const Route = createFileRoute('/_dashboard/friends/$friend/$expense')({
  component: RootComponent,
  errorComponent: () => <div>Error</div>,
});

function RootComponent() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      if (modalRef.current) {
        const animations = modalRef.current
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished);
        Promise.allSettled(animations).finally(() => {
          return navigate({ to: '/friends/$friend', params: params, replace: true });
        });
      } else {
        navigate({ to: '/friends/$friend', params: params, replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!params.expense) return null;

  return (
    <ExpenseDetail
      ref={modalRef}
      isOpen={isOpen}
      expenseId={params.expense}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    />
  );
}
