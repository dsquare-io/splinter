import { Fragment } from 'react';

import { Activity, type Object_ } from '@/api-types';
import { UserLabel } from '@/components/primitives';
import { parseUrn } from '../Template/urnParser.ts';

type TextToken = { type: 'text'; value: string; index: number };
type SubstitutionToken = { type: 'substitution'; key: string; index: number };
export type TemplateToken = TextToken | SubstitutionToken;

function parseTemplate(template: string): TemplateToken[] {
  const tokens: TemplateToken[] = [];
  const regex = /\{(\w+)}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: template.slice(lastIndex, match.index), index: tokens.length });
    }
    tokens.push({ type: 'substitution', key: match[1], index: tokens.length });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    tokens.push({ type: 'text', value: template.slice(lastIndex), index: tokens.length });
  }

  return tokens;
}

type ActivityDescriptionProps = {
  activity: Activity;
};

export function ActivityDescription({ activity }: ActivityDescriptionProps) {
  const nodes = parseTemplate(activity.template).map((token) => {
    if (token.type === 'text') return token.value;

    if (token.key === 'actor') {
      return (
        <span className="font-semibold">
          <UserLabel
            user={activity.actor}
            inline={token.index >= 1}
          />
        </span>
      );
    }

    const object: Object_ = activity[token.key as 'target' | 'object'];
    const parsed = parseUrn(object.urn);

    switch (parsed?.modelType) {
      case 'user':
        return (
          <span className="font-semibold">
            <UserLabel
              user={{
                uid: object.uid,
                urn: object.urn,
                name: object.urn,
                isActive: true,
              }}
              inline={token.index >= 1}
            />
          </span>
        );
      case 'expense':
        return <span className="font-semibold">{object.value}</span>;
      case 'activity:comment': {
        const trimmed = object.value.length > 32 ? `${object.value.slice(0, 32)}…` : object.value;
        return <span className="italic">"{trimmed}"</span>;
      }
      default:
        return <>{object.value}</>;
    }
  });

  return (
    <p>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </p>
  );
}
