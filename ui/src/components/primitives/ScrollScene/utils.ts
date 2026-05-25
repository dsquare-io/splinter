export function isAnimProp(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number'
  );
}
