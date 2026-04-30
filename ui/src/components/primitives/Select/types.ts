export type SelectItemRenderMode = 'tag' | 'list';

export type SelectItemRenderProps<T extends Record<string, any>> = {
  item: T;
  renderMode: SelectItemRenderMode;
};
