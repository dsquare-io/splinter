import { Fragment, ReactNode } from 'react';

import type { Object_ } from '@/api-types';
import { Money } from '@/components/primitives/Money';
import {parseUrn} from '@/features/ActivityDescription';

type TemplateProps = {
  string: string;
  references: Record<string, Object_>;
};

export function Template({ string, references }: TemplateProps) {
  const parts: ReactNode[] = [];
  const pattern = /\[\[([^[\]]+)]]/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(string)) !== null) {
    if (match.index > lastIndex) {
      parts.push(string.slice(lastIndex, match.index));
    }

    const content = match[1];
    const colonIdx = content.indexOf(':');
    const type = colonIdx === -1 ? content : content.slice(0, colonIdx);
    const value = colonIdx === -1 ? '' : content.slice(colonIdx + 1);

    if (type === 'money') {
      const semicolonIdx = value.indexOf(';');
      const currency = value.slice(0, semicolonIdx);
      const amount = value.slice(semicolonIdx + 1);
      parts.push(
        <Money
          key={match.index}
          currency={currency}
          value={amount}
          noColor
        />
      );
    } else if (type === 'urn') {
      const ref = references[content];
      parts.push(ref ? ref.value : parseUrn(content)?.modelUid);
    } else {
      parts.push(match[0]);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < string.length) {
    parts.push(string.slice(lastIndex));
  }

  return <Fragment>{parts}</Fragment>;
}
