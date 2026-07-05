type ClassValue = string | number | null | undefined | false | ClassValue[] | { [key: string]: boolean | undefined };

function flatten(value: ClassValue, out: string[]) {
  if (!value) return;
  if (typeof value === 'string' || typeof value === 'number') {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => flatten(item, out));
    return;
  }
  Object.entries(value).forEach(([key, condition]) => {
    if (condition) out.push(key);
  });
}

export function cn(...values: ClassValue[]) {
  const out: string[] = [];
  values.forEach((value) => flatten(value, out));
  return out.join(' ');
}
