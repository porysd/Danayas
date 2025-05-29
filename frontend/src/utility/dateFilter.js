export function filterRange(dateStr, from, to) {
  const date = new Date(dateStr);
  return date >= from && date <= to;
}
