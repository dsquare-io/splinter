import { useEffect, useRef, useState } from 'react';

import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';

import { ExpenseDetail } from '@/features/ExpenseDetail';

export const Route = createLazyFileRoute('/_dashboard/groups/$group/$expense')({
  component: RootComponent,
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
          return navigate({ to: '/groups/$group', params: params, replace: true });
        });
      } else {
        navigate({ to: '/groups/$group', params: params, replace: true });
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
