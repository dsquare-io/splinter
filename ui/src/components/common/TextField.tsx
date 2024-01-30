import {tv} from 'tailwind-variants';

import {fieldBorderStyles} from './Field';
import {focusRing} from './utils';

export const inputStyles = tv({
  extend: focusRing,
  base: [...fieldBorderStyles.base, 'shadow'],
  variants: {
    isFocused: fieldBorderStyles.variants.isFocusWithin,
    ...fieldBorderStyles.variants,
  },
});
