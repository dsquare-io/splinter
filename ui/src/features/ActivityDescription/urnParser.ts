export type ParsedUrn = {
  modelType: string;
  modelUid: string;
};

export function parseUrn(urn: string | null | undefined): ParsedUrn | null {
  if (!urn) return null;
  const match = urn.match(/^urn:splinter:([\w:]+)\/(.+)$/);
  if (!match) return null;
  return { modelType: match[1], modelUid: match[2] };
}
