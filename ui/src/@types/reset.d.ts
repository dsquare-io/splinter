import "@total-typescript/ts-reset";

export declare module 'react' {
  interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    /**
     * Indicates that the browser will ignore this element and its descendants,
     * preventing some interactions and hiding it from assistive technology.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert
     * @todo Remove this stub declaration after https://github.com/facebook/react/pull/24730 is merged.
     */
    inert?: '';
    slot?: string | null | undefined;
  }
}
