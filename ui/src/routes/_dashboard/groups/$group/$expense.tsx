import {useEffect, useRef, useState} from 'react';

import {createFileRoute, useNavigate} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import ExpenseDetail from '@/components/modals/ExpenseDetail/ExpenseDetail';
import {apiQueryOptions} from '@/hooks/useApiQuery';
import {queryClient} from '@/queryClient';

export const Route = createFileRoute('/_dashboard/groups/$group/$expense')({
  loader: ({params: {expense: expense_uid}}) =>
    expense_uid
      ? queryClient.ensureQueryData(apiQueryOptions(ApiRoutes.EXPENSE_DETAIL, {expense_uid}))
      : undefined,
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
          .getAnimations({subtree: true})
          .map((animation) => animation.finished);
        Promise.allSettled(animations).finally(() => {
          return navigate({to: '/groups/$group', params: params, replace: true});
        });
      } else {
        navigate({to: '/groups/$group', params: params, replace: true});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!params.expense) return null;

  return (
    <ExpenseDetail
      ref={modalRef}
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    />
  );
}
