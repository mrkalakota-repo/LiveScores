import { formatGameTime, formatLastUpdated } from '@/utils/dateHelpers';

describe('formatGameTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns time only for a game today', () => {
    const now = new Date('2024-01-15T10:00:00');
    jest.setSystemTime(now);
    // Game at 3 PM same day
    const iso = '2024-01-15T15:00:00';
    const result = formatGameTime(iso);
    // Should not contain a date prefix, just time
    expect(result).not.toMatch(/Jan/);
  });

  it('returns date + time for a game on another day', () => {
    const now = new Date('2024-01-15T10:00:00');
    jest.setSystemTime(now);
    const iso = '2024-01-20T15:00:00';
    const result = formatGameTime(iso);
    expect(result).toMatch(/Jan/);
  });

  it('handles invalid date gracefully', () => {
    expect(() => formatGameTime('not-a-date')).not.toThrow();
  });
});

describe('formatLastUpdated', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "just now" for timestamps within 5 seconds', () => {
    const now = Date.now();
    jest.setSystemTime(now);
    expect(formatLastUpdated(now - 3000)).toBe('just now');
    expect(formatLastUpdated(now)).toBe('just now');
  });

  it('returns seconds for timestamps between 5s and 60s', () => {
    const now = Date.now();
    jest.setSystemTime(now);
    expect(formatLastUpdated(now - 10_000)).toBe('10s ago');
    expect(formatLastUpdated(now - 59_000)).toBe('59s ago');
  });

  it('returns minutes for timestamps over 60 seconds', () => {
    const now = Date.now();
    jest.setSystemTime(now);
    expect(formatLastUpdated(now - 60_000)).toBe('1m ago');
    expect(formatLastUpdated(now - 120_000)).toBe('2m ago');
    expect(formatLastUpdated(now - 300_000)).toBe('5m ago');
  });
});
