import { useEffect, useRef, useState } from 'react';

import { useNavigate, useParams, useRouterState } from '@tanstack/react-router';

import { Dialog } from '@/components/primitives';
import { ExpenseActivity } from '@/features/ExpenseActivity';
import { ExpenseDetail } from '@/features/ExpenseDetail';
import { ExpenseDialogHeader } from './ExpenseDialogHeader.tsx';

export function ExpenseDetailDialog() {
  const routeMatches = useRouterState({
    select: (s) => s.matches,
  });

  const params = useParams({ strict: false }) as { friend?: string; group?: string; expense: string };
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      const currentRoute = routeMatches[routeMatches.length - 1];
      const parentPath = currentRoute.fullPath.substring(0, currentRoute.fullPath.lastIndexOf('/'));

      if (ref.current) {
        const animations = ref.current
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished);
        Promise.allSettled(animations).finally(() => {
          return navigate({ to: parentPath, params, replace: true });
        });
      } else {
        void navigate({ to: parentPath, params, replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const expense = params.expense;
  if (!expense) return null;

  return (
    <Dialog
      ref={ref}
      variant="drawer"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isDismissable
    >
      <ExpenseDialogHeader expenseId={expense} />

      <ExpenseDetail expenseId={expense} />

      <hr className="my-6 border-gray-300" />

      <ExpenseActivity expenseId={expense} />
    </Dialog>
  );
}
