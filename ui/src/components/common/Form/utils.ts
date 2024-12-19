const focusableInputElements = [
  'select:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type=hidden])',
];

const FOCUSABLE_INPUT_ELEMENT_SELECTOR = focusableInputElements.join(':not([hidden]),');

export function getFocusableRef(rootNode: HTMLElement) {
  const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      if ((node as HTMLElement).tagName === 'label' && (node as HTMLLabelElement).htmlFor) {
        return NodeFilter.FILTER_ACCEPT;
      }

      if ((node as Element).matches(FOCUSABLE_INPUT_ELEMENT_SELECTOR)) {
        return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_SKIP;
    },
  });

  if (walker.nextNode()) {
    return walker.currentNode as HTMLElement;
  }
  return rootNode;
}