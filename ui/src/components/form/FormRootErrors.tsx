import { useMemo } from 'react';
import { useFormContext, type FieldErrors } from 'react-hook-form';

import { AnimatePresence, motion } from 'framer-motion';

import { flattenFieldErrors } from '@/components/form/errors.ts';
import { Alert } from '@/components/primitives';

export function FormRootErrors({ className }: { className?: string }) {
  const form = useFormContext();

  const rootError = form.formState.errors.root;
  const formErrors = useMemo(() => {
    if (form.formState.errors.form) return flattenFieldErrors(form.formState.errors.form as FieldErrors);

    return [];
  }, [form.formState.errors.form]);

  return (
    <AnimatePresence mode="wait">
      {rootError && (
        <motion.div
          style={{ overflow: 'hidden' }}
          initial={{ opacity: 0, height: 0, marginBottom: -24 }}
          animate={{
            opacity: 1,
            height: 'auto',
            marginBottom: 0,
            transition: {
              height: {
                duration: 0.3,
              },
              opacity: {
                duration: 0.25,
                delay: 0.05,
              },
            },
          }}
          exit={{
            opacity: 0,
            height: 0,
            marginBottom: -24,
            transition: {
              height: {
                duration: 0.25,
              },
              opacity: {
                duration: 0.15,
              },
            },
          }}
        >
          <Alert
            title={rootError!.message}
            color="danger"
            className={className}
            onDismiss={() => {
              form?.clearErrors('root');
              form?.clearErrors('form');
            }}
          >
            {formErrors.length > 0 && (
              <ul className="mt-1 list-disc text-left text-sm text-gray-500">
                {formErrors.map((e) => (
                  <li key={e.key}>
                    {e.key}: {e.message}
                  </li>
                ))}
              </ul>
            )}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
