/**
 * useGameSummary hook tests
 *
 * fetchGameSummary is mocked to avoid real HTTP calls.
 * The hook's queryFn transforms raw ESPN summary data inline.
 */
jest.mock('@/api/espn', () => ({
  fetchGameSummary: jest.fn(),
}));

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGameSummary } from '@/hooks/useGameSummary';
import { fetchGameSummary } from '@/api/espn';
import { AppError } from '@/api/errors';

const mockFetch = fetchGameSummary as jest.Mock;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { gcTime: 0 } },
    logger: { log: () => {}, warn: () => {}, error: () => {} } as never,
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

function makeRawSummary(overrides: Record<string, unknown> = {}) {
  return {
    header: {
      competitions: [
        {
          status: {
            type: {
              id: '3',
              name: 'STATUS_FINAL',
              state: 'post',
              completed: true,
              description: 'Final',
              detail: 'Final',
              shortDetail: 'Final',
            },
          },
          competitors: [
            {
              homeAway: 'home',
              score: '28',
              winner: true,
              team: { abbreviation: 'KC', displayName: 'Chiefs', logo: '' },
              records: [{ type: 'total', summary: '14-3' }],
              linescores: [{ value: 7 }, { value: 0 }, { value: 10 }, { value: 11 }],
            },
            {
              homeAway: 'away',
              score: '21',
              winner: false,
              team: { abbreviation: 'BUF', displayName: 'Bills', logo: '' },
              records: [{ type: 'total', summary: '12-5' }],
              linescores: [{ value: 7 }, { value: 7 }, { value: 7 }, { value: 0 }],
            },
          ],
          venue: { fullName: 'Arrowhead Stadium' },
          broadcasts: [{ names: ['CBS'] }],
        },
      ],
    },
    boxscore: {
      teams: [
        {
          team: { abbreviation: 'KC' },
          statistics: [
            { name: 'passingYards', label: 'Pass Yds', displayValue: '312' },
            { name: 'rushingYards', label: 'Rush Yds', displayValue: '98' },
          ],
        },
        {
          team: { abbreviation: 'BUF' },
          statistics: [
            { name: 'passingYards', label: 'Pass Yds', displayValue: '278' },
          ],
        },
      ],
    },
    plays: [
      { id: 'p1', text: 'Touchdown pass', clock: { displayValue: '2:30' }, team: { abbreviation: 'KC' }, scoreValue: 6 },
      { id: 'p2', text: 'Extra point good', clock: { displayValue: '2:28' }, team: { abbreviation: 'KC' }, scoreValue: 1 },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('useGameSummary', () => {
  it('returns transformed data on success', async () => {
    mockFetch.mockResolvedValueOnce(makeRawSummary());

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.homeTeam.abbreviation).toBe('KC');
    expect(data.homeTeam.score).toBe('28');
    expect(data.homeTeam.winner).toBe(true);
    expect(data.awayTeam.abbreviation).toBe('BUF');
    expect(data.status).toBe('final');
    expect(data.statusText).toBe('Final');
    expect(data.venue).toBe('Arrowhead Stadium');
    expect(data.broadcasts).toContain('CBS');
  });

  it('maps home team linescores', async () => {
    mockFetch.mockResolvedValueOnce(makeRawSummary());

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.homeTeam.linescores).toEqual([7, 0, 10, 11]);
    expect(result.current.data?.awayTeam.linescores).toEqual([7, 7, 7, 0]);
  });

  it('extracts home and away stats', async () => {
    mockFetch.mockResolvedValueOnce(makeRawSummary());

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.homeStats).toContainEqual({ label: 'Pass Yds', value: '312' });
    expect(result.current.data?.awayStats).toContainEqual({ label: 'Pass Yds', value: '278' });
  });

  it('extracts recent plays (most recent first)', async () => {
    mockFetch.mockResolvedValueOnce(makeRawSummary());

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const plays = result.current.data?.recentPlays ?? [];
    expect(plays.length).toBeGreaterThan(0);
    // Most recent play should come first (reversed)
    expect(plays[0].text).toBe('Extra point good');
    expect(plays[1].text).toBe('Touchdown pass');
  });

  it('marks scoring plays correctly', async () => {
    mockFetch.mockResolvedValueOnce(makeRawSummary());

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const plays = result.current.data?.recentPlays ?? [];
    // Touchdown (scoreValue=6) and extra point (scoreValue=1) both > 0 → isScore true
    expect(plays.every(p => p.isScore)).toBe(true);
  });

  it('is initially loading', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '99999'),
      { wrapper: makeWrapper() },
    );
    expect(result.current.isLoading).toBe(true);
  });

  it('surfaces error on network failure (after retries exhausted)', async () => {
    // mockRejectedValue (not Once) ensures all retry attempts also fail
    mockFetch.mockRejectedValue(new AppError('network', 'No connection'));

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 10_000 });
    expect(result.current.error?.kind).toBe('network');
    mockFetch.mockReset();
  });

  it('surfaces not_found error for 404 immediately (no retries)', async () => {
    // not_found skips retries, so Once is sufficient
    mockFetch.mockRejectedValueOnce(new AppError('not_found', 'Not found', 404));

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('not_found');
  });

  it('throws (via queryFn) when competition is missing from header', async () => {
    mockFetch.mockResolvedValueOnce({ header: { competitions: [] } });

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('handles missing boxscore gracefully (empty stats)', async () => {
    const raw = makeRawSummary();
    delete (raw as Record<string, unknown>).boxscore;
    mockFetch.mockResolvedValueOnce(raw);

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.homeStats).toEqual([]);
    expect(result.current.data?.awayStats).toEqual([]);
  });

  it('handles missing plays gracefully (empty recentPlays)', async () => {
    const raw = makeRawSummary();
    delete (raw as Record<string, unknown>).plays;
    mockFetch.mockResolvedValueOnce(raw);

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.recentPlays).toEqual([]);
  });

  it('does not include plays with empty text', async () => {
    const raw = makeRawSummary();
    (raw.plays as unknown[]).push({ id: 'p3', text: '   ', scoreValue: 0 });
    mockFetch.mockResolvedValueOnce(raw);

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const plays = result.current.data?.recentPlays ?? [];
    expect(plays.every(p => p.text.trim().length > 0)).toBe(true);
  });

  it('uses non-ISO detail as-is for scheduled games', async () => {
    const raw = makeRawSummary({
      header: {
        competitions: [
          {
            status: {
              type: {
                id: '1',
                name: 'STATUS_SCHEDULED',
                state: 'pre',
                completed: false,
                description: 'Scheduled',
                detail: '7:30 PM ET',
                shortDetail: '7:30 PM ET',
              },
            },
            competitors: (makeRawSummary().header!.competitions![0] as { competitors: unknown[] }).competitors,
            venue: { fullName: 'Stadium' },
            broadcasts: [],
          },
        ],
      },
    });
    mockFetch.mockResolvedValueOnce(raw);

    const { result } = renderHook(
      () => useGameSummary('football', 'nfl', '12345'),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Non-ISO time string should pass through unchanged
    expect(result.current.data?.statusText).toBe('7:30 PM ET');
  });
});
