import { computeWinProbability, parseWinPct, estimateProgress } from '@/utils/winProbability';

describe('parseWinPct', () => {
  it('parses W-L records', () => {
    expect(parseWinPct('10-5')).toBeCloseTo(0.667, 2);
  });

  it('parses W-L-T records (ties count as 0.5)', () => {
    expect(parseWinPct('8-4-2')).toBeCloseTo(0.643, 2);
  });

  it('returns null for missing or invalid records', () => {
    expect(parseWinPct(undefined)).toBeNull();
    expect(parseWinPct('abc')).toBeNull();
    expect(parseWinPct('0-0')).toBeNull();
  });
});

describe('estimateProgress', () => {
  it('returns 0.5 for halftime', () => {
    expect(estimateProgress('HALFTIME', 'football')).toBe(0.5);
    expect(estimateProgress('HT', 'soccer')).toBe(0.5);
  });

  it('returns 1.0 for overtime', () => {
    expect(estimateProgress('OT 2:00', 'basketball')).toBe(1.0);
    expect(estimateProgress('OVERTIME', 'hockey')).toBe(1.0);
  });

  it('returns higher progress for later quarters', () => {
    const q1 = estimateProgress('Q1 10:00', 'football');
    const q3 = estimateProgress('Q3 10:00', 'football');
    expect(q3).toBeGreaterThan(q1);
  });

  it('returns higher progress for later periods (hockey)', () => {
    const p1 = estimateProgress('1ST 10:00', 'hockey');
    const p3 = estimateProgress('3RD 10:00', 'hockey');
    expect(p3).toBeGreaterThan(p1);
  });
});

describe('computeWinProbability', () => {
  const base = {
    homeStats: [],
    awayStats: [],
    statusText: 'Q3 5:00',
    sport: 'football',
  };

  it('returns null for final games', () => {
    expect(
      computeWinProbability({ ...base, homeScore: '21', awayScore: '14', status: 'final' }),
    ).toBeNull();
  });

  it('returns null for scheduled games with no records', () => {
    expect(
      computeWinProbability({ ...base, homeScore: '0', awayScore: '0', status: 'scheduled' }),
    ).toBeNull();
  });

  it('gives higher probability to the leading team during a live game', () => {
    const result = computeWinProbability({
      ...base,
      homeScore: '21',
      awayScore: '7',
      status: 'live',
    });
    expect(result).not.toBeNull();
    expect(result!.home).toBeGreaterThan(result!.away);
    expect(result!.basis).toBe('score');
  });

  it('gives higher probability to the team with a better record when scheduled', () => {
    const result = computeWinProbability({
      ...base,
      homeScore: '0',
      awayScore: '0',
      homeRecord: '12-2',
      awayRecord: '4-10',
      status: 'scheduled',
      statusText: '7:30 PM ET',
    });
    expect(result).not.toBeNull();
    expect(result!.home).toBeGreaterThan(result!.away);
    expect(result!.basis).toBe('record');
  });

  it('probabilities always sum to 100', () => {
    const result = computeWinProbability({
      ...base,
      homeScore: '17',
      awayScore: '14',
      status: 'live',
    });
    expect(result).not.toBeNull();
    expect(result!.home + result!.away).toBe(100);
  });

  it('returns probability for tennis live (sets-won format)', () => {
    const result = computeWinProbability({ ...base, homeScore: '2', awayScore: '1', status: 'live', sport: 'tennis' });
    expect(result).not.toBeNull();
    expect(result!.home + result!.away).toBe(100);
    expect(result!.home).toBeGreaterThan(result!.away); // home leads 2-1
  });

  it('returns probability for cricket live (run differential)', () => {
    const result = computeWinProbability({ ...base, homeScore: '180', awayScore: '120', status: 'live', sport: 'cricket' });
    expect(result).not.toBeNull();
    expect(result!.home + result!.away).toBe(100);
    expect(result!.home).toBeGreaterThan(result!.away); // home has more runs
  });

  it('record component adjusts live probability when score is tied', () => {
    const tied = computeWinProbability({
      ...base,
      homeScore: '14',
      awayScore: '14',
      homeRecord: '12-2',
      awayRecord: '2-12',
      status: 'live',
      statusText: 'Q1 10:00',
    });
    expect(tied).not.toBeNull();
    // Better-record home team should still be favoured even when tied early
    expect(tied!.home).toBeGreaterThan(tied!.away);
  });
});
