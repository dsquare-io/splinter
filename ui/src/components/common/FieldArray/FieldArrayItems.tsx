import {ComponentProps, type ReactNode, useContext} from 'react';
import {ButtonContext, Provider} from 'react-aria-components';
import {type FieldArrayWithId} from 'react-hook-form';

import {FieldArrayContext} from '@/components/common/FieldArray/FieldArray.tsx';
import {type RenderProps, composeRenderProps} from '@/components/common/render-props.ts';

import {useCachedChildren} from './utils.ts';

interface FieldArrayItemsRenderProps {
  field: FieldArrayWithId;
  /**
   * index of current item
   */
  index: number;
  /**
   * removes current item from field array
   */
  remove: () => void;
}

interface Props
  extends Pick<RenderProps<FieldArrayItemsRenderProps>, 'children'>,
    Omit<ComponentProps<'div'>, 'children'> {
  renderEmptyState?: () => ReactNode;
}

export function FieldArrayItems({renderEmptyState, children, ...props}: Props) {
  const context = useContext(FieldArrayContext);

  if (!context) {
    throw new Error("FieldArrayItems can't be used outside FieldArray");
  }

  const {fields, remove, keyName} = context;

  const cachedChildren = useCachedChildren({
    children: composeRenderProps(children, (renderedChildren, renderProps) => (
      <Provider
        values={[
          [
            ButtonContext,
            {
              slots: {
                remove: {
                  onPress: () => {
                    console.log('hereee');
                    remove(renderProps.index);
                  },
                },
              },
            },
          ],
        ]}
      >
        {renderedChildren}
      </Provider>
    )),
    items: fields.map((field, index) => ({
      field,
      id: (field as any)[keyName] as string,
      index,
      remove: () => remove(index),
    })),
  });

  if (fields.length === 0) {
    if (renderEmptyState) {
      return renderEmptyState();
    }
    return null;
  }

  return <div {...props}>{cachedChildren}</div>;
}
