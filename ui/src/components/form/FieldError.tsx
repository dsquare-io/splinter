import clsx from 'clsx';
import { ReactNode, useContext, type ComponentProps } from 'react';
import { FieldErrorRenderProps, FieldError as RACFieldError } from 'react-aria-components';

import { AnimatePresence, motion } from 'framer-motion';

import { FieldErrorContext } from './context';

type FieldErrorProps = Omit<ComponentProps<typeof RACFieldError>, 'children'> & {
  children?: ReactNode | ((val: ReactNode, renderProps: FieldErrorRenderProps) => ReactNode);
};

export function FieldError({ className, ...props }: FieldErrorProps) {
  const context = useContext(FieldErrorContext);

  return (
    <RACFieldError
      {...props}
      className="contents"
    >
      {(validation) => {
        const validationErrors = validation.validationErrors.join(' ');
        const renderedMessage: ReactNode = context?.message ?? validationErrors;

        return (
          <AnimatePresence>
            {renderedMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className={clsx(
                  typeof className === 'function'
                    ? className({ ...validation, defaultClassName: '' })
                    : className,
                  'mt-1.5 block text-xs text-red-600'
                )}
              >
                {renderedMessage}
              </motion.div>
            )}
          </AnimatePresence>
        );
      }}
    </RACFieldError>
  );
}
