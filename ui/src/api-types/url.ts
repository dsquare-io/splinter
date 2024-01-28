import type {A} from 'ts-toolbelt';

type IsParameter<Part> = Part extends `{${infer ParamName}}` ? ParamName : never;
type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}`
  ? IsParameter<PartA> | FilteredParts<PartB>
  : IsParameter<Path>;

export type Args<Path> = {
  [Key in FilteredParts<Path>]: string | number;
};

const baseUrl = 'http://example.com';

/**
 * DOESN'T WORK WITH RELATIVE URLS WHEN params are provided
 */
export function urlWithArgs<P extends string>(
  url: P,
  args: A.Compute<Partial<Args<P>>, 'flat'>,
  params: Partial<Record<string, string | number | undefined | string[]>> = {}
): P {
  let newUrl = url.replace(/{(\w+)}/g, (_, key: string) => (args as any)[key]?.toString() ?? '');
  if (!params) return newUrl as P;

  const urlObj = new URL(newUrl, baseUrl);

  for (const [key, val] of Object.entries(params)) {
    if (Array.isArray(val)) {
      val.forEach((v) => urlObj.searchParams.append(key, v.toString()));
    } else if (val) {
      urlObj.searchParams.set(key, val.toString());
    }
  }

  newUrl = urlObj.toString().replace(new RegExp(`^${baseUrl}`), '');

  return newUrl as P;
}
