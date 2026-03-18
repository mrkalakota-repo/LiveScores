import { getGameStatus, getStatusText, getPeriodLabel } from '@/utils/statusHelpers';
import type { EspnStatus } from '@/api/types';

function makeStatus(
  state: 'pre' | 'in' | 'post',
  overrides: Partial<EspnStatus['type']> = {},
  clock?: number,
  period?: number,
  displayClock?: string,
): EspnStatus {
  return {
    clock,
    displayClock,
    period,
    type: {
      id: '1',
      name: 'STATUS',
      state,
      completed: state === 'post',
      description: 'In Progress',
      detail: 'In Progress',
      shortDetail: 'IP',
      ...overrides,
    },
  };
}

// ── getGameStatus ──────────────────────────────────────────────────────────

describe('getGameStatus', () => {
  it('returns "final" for post state', () => {
    expect(getGameStatus(makeStatus('post'))).toBe('final');
  });

  it('returns "scheduled" for pre state', () => {
    expect(getGameStatus(makeStatus('pre'))).toBe('scheduled');
  });

  it('returns "live" for in-progress state', () => {
    expect(getGameStatus(makeStatus('in'))).toBe('live');
  });

  it('returns "halftime" when detail contains "half"', () => {
    expect(getGameStatus(makeStatus('in', { detail: 'Halftime' }))).toBe('halftime');
  });

  it('returns "halftime" for tea break (cricket)', () => {
    expect(getGameStatus(makeStatus('in', { detail: 'Tea Break' }))).toBe('halftime');
  });

  it('returns "halftime" for lunch break (cricket)', () => {
    expect(getGameStatus(makeStatus('in', { detail: 'Lunch Break' }))).toBe('halftime');
  });
});

// ── getStatusText ──────────────────────────────────────────────────────────

describe('getStatusText', () => {
  it('returns "Final" for post state', () => {
    expect(getStatusText(makeStatus('post'), 'football')).toBe('Final');
  });

  it('returns shortDetail for pre state', () => {
    const s = makeStatus('pre', { shortDetail: '7:30 PM ET' });
    expect(getStatusText(s, 'football')).toBe('7:30 PM ET');
  });

  it('returns detail fallback when shortDetail missing for pre', () => {
    const s = makeStatus('pre', { shortDetail: '', detail: 'Sunday 7:30 PM' });
    expect(getStatusText(s, 'football')).toBe('Sunday 7:30 PM');
  });

  it('formats football live status with quarter and clock', () => {
    const s = makeStatus('in', {}, undefined, 2, '5:30');
    expect(getStatusText(s, 'football')).toBe('Q2 5:30');
  });

  it('formats basketball live status with quarter and clock', () => {
    const s = makeStatus('in', {}, undefined, 3, '2:15');
    expect(getStatusText(s, 'basketball')).toBe('Q3 2:15');
  });

  it('formats basketball overtime', () => {
    const s = makeStatus('in', {}, undefined, 5, '1:00');
    expect(getStatusText(s, 'basketball')).toBe('OT1 1:00');
  });

  it('formats hockey live status', () => {
    const s = makeStatus('in', {}, undefined, 1, '12:34');
    expect(getStatusText(s, 'hockey')).toBe('P1 12:34');
  });

  it('formats hockey overtime', () => {
    const s = makeStatus('in', {}, undefined, 4, '3:22');
    expect(getStatusText(s, 'hockey')).toBe('OT 3:22');
  });

  it('formats soccer with minute clock', () => {
    const s = makeStatus('in', {}, undefined, undefined, '67');
    expect(getStatusText(s, 'soccer')).toBe("67'");
  });

  it('falls back to shortDetail for baseball', () => {
    const s = makeStatus('in', { shortDetail: 'Top 5th' });
    expect(getStatusText(s, 'baseball')).toBe('Top 5th');
  });

  it('falls back to shortDetail for cricket', () => {
    const s = makeStatus('in', { shortDetail: '22.4 ov' });
    expect(getStatusText(s, 'cricket')).toBe('22.4 ov');
  });

  it('falls back to shortDetail for tennis', () => {
    const s = makeStatus('in', { shortDetail: 'Set 2' });
    expect(getStatusText(s, 'tennis')).toBe('Set 2');
  });
});

// ── getPeriodLabel ─────────────────────────────────────────────────────────

describe('getPeriodLabel', () => {
  it.each([
    ['football', 1, 'Q1'],
    ['football', 4, 'Q4'],
    ['basketball', 1, 'Q1'],
    ['basketball', 4, 'Q4'],
    ['basketball', 5, 'OT1'],
    ['basketball', 6, 'OT2'],
    ['hockey', 1, 'P1'],
    ['hockey', 3, 'P3'],
    ['hockey', 4, 'OT'],
    ['cricket', 1, 'Inn 1'],
    ['cricket', 2, 'Inn 2'],
  ] as const)('%s period %d → %s', (sport, period, expected) => {
    expect(getPeriodLabel(sport, period)).toBe(expected);
  });

  it('returns period number string for unknown sport', () => {
    expect(getPeriodLabel('unknown', 3)).toBe('3');
  });
});
