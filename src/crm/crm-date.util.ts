/** CRM request timestamps look like `2025-07-19 16:49:47`. */
export function formatCrmDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Rolling window start: now minus one calendar year. */
export function oneYearAgoDate(from: Date = new Date()): Date {
  const date = new Date(from);
  date.setFullYear(date.getFullYear() - 1);
  return date;
}
