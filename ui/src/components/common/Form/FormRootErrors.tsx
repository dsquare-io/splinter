import {useFormContext} from 'react-hook-form';

import {AnimatePresence, motion} from 'framer-motion';

import {Alert} from '../Alert';


export function FormRootErrors({error}: {error?: string}) {
  const form = useFormContext();

  return (
    <AnimatePresence mode="wait">
      {(error || form?.formState.errors?.root?.message) && (
        <motion.div
          style={{overflow: 'hidden'}}
          initial={{opacity: 0, height: 0, marginBottom: -24}}
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
            title={(error || form?.formState.errors?.root?.message)}
            color="danger"
            onDismiss={() => form?.clearErrors('root')}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
