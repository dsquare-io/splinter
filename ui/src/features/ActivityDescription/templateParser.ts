import { ReactNode } from 'react';

type TextToken = { type: 'text'; value: string };
type SubstitutionToken = { type: 'substitution'; key: string };
export type TemplateToken = TextToken | SubstitutionToken;

export function parseTemplate(template: string): TemplateToken[] {
  const tokens: TemplateToken[] = [];
  const regex = /\{(\w+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: template.slice(lastIndex, match.index) });
    }
    tokens.push({ type: 'substitution', key: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    tokens.push({ type: 'text', value: template.slice(lastIndex) });
  }

  return tokens;
}

export type TemplateSubstitutions = Record<string, ReactNode>;

export function renderTemplate(template: string, substitutions: TemplateSubstitutions): ReactNode[] {
  return parseTemplate(template).map((token) => {
    if (token.type === 'text') return token.value;
    return substitutions[token.key] ?? `{${token.key}}`;
  });
}
