export function parsePositiveNumber(value: unknown, fallback: number) {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}
