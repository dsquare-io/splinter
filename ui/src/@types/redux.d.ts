import type {RootState} from '@/store';

// Although redux docs preaches the idea of creating typed version of useSelector
// and useDispatch hooks but, I personally prefer module augmentation way
// inspired from tanstack router.
//
// it works for me. if you want to known why not to do module
// augmentation (https://x.com/mattpocockuk/status/1756090430645555611?s=20)
// ask @mattpocockuk

declare module 'react-redux' {
  interface UseSelector {
    <Selected = unknown>(
      selector: (state: RootState) => Selected,
      equalityFnOrOptions?: EqualityFn<Selected> | UseSelectorOptions<Selected>
    ): Selected;
  }
}

export {};
