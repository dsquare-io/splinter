interface Transformer {
  (actualKey: string, value: any, args: string[]):
    | [string, any]
    | readonly [string, any];
}

interface ParsedKey {
  fn: string;
  args: string[];
  actualKey: string;
}

/**
 * Transformers are special keywords if added to the field names will transform the form data before submission.
 *
 * examples:
 *  field with name `participants:del` will be omitted before submission.
 *
 *  also consider the following jsx:
 *  ```jsx
 *  <FieldScope name="shares:to_dict__id__val">
 *    <Field name="user1" value="1" />
 *    <Field name="user2" value="2" />
 *  </FieldScope>
 *  ```
 *  the data from the above fields will be transformed as the following:
 *  ```js
 *  {shares: [{id: 'user1', value: '1'}, {id: 'user2', value: '2'}]}
 *  ```
 */
export function applyTransformers<T>(data: T) {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return data;
  }

  const newData: Record<PropertyKey, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const { actualKey, fn, args } = parseKey(key);
    let mappedValue = value;
    let mappedKey = actualKey;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      mappedValue = applyTransformers(value);
    }
    if (Array.isArray(value)) {
      mappedValue = value.map(applyTransformers)
    }

    if (fn && transformerMap[fn]) {
      [mappedKey, mappedValue] =
        transformerMap[fn](actualKey, mappedValue, args) ?? [];
    }

    if (newData[mappedKey] && mappedValue) {
      newData[mappedKey] = { ...newData[mappedKey], ...mappedValue };
    } else if (mappedValue) {
      newData[mappedKey] = mappedValue;
    }
  }

  return newData;
}

function parseKey(key: string): ParsedKey {
  const [actualKey, op = ""] = key.split(":");
  const [fn, ...args ] = op.split("__");
  return {
    fn,
    actualKey,
    args,
  };
}

const transformerMap: Record<string, Transformer> = {
  del: (k) => [k, undefined],
  now: (k) => [k, new Date().toISOString()],
  to_dict: toDict,
} satisfies Record<string, Transformer>;

function toDict(baseKey: string, value: unknown, args: string[]) {
  const keyName = args?.[0] ? args[0] : "id";
  const valueName = args?.[1] ? args[1] : "value";

  if (typeof value === "object" && value !== null) {
    const newValue = Object.entries(value).map(([k, v]) => ({[keyName]: k, [valueName]: v}));
    return [baseKey, newValue] as const;
  }
  return [baseKey, value] as const;
}
