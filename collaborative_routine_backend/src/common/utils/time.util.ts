export function toTimeOnly(date: Date): string {
  return date.toISOString().slice(11, 19);
}
