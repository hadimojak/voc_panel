import { formatCrmDateTime, oneYearAgoDate } from './crm-date.util';

describe('crm-date.util', () => {
  it('formats CRM timestamps', () => {
    const date = new Date(2025, 6, 19, 16, 49, 47);
    expect(formatCrmDateTime(date)).toBe('2025-07-19 16:49:47');
  });

  it('computes one year ago', () => {
    const from = new Date(2026, 10, 7, 12, 0, 0);
    const ago = oneYearAgoDate(from);
    expect(ago.getFullYear()).toBe(2025);
    expect(ago.getMonth()).toBe(10);
    expect(ago.getDate()).toBe(7);
  });
});
