/**
 * useScoreboard hook tests
 *
 * Uses a real QueryClient with short gcTime so cache doesn't bleed between tests.
 * fetchScoreboard and transformScoreboard are mocked via the module system.
 *
 * Note: the hook has its own retry function (up to 2 retries for non-404 errors)
 * so error tests use mockRejectedValue (not Once) to cover all attempts.
 */
jest.mock('@/api/espn', () => ({
  fetchScoreboard: jest.fn(),
}));
jest.mock('@/utils/transformers', () => ({
  transformScoreboard: jest.fn(),
}));

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useScoreboard } from '@/hooks/useScoreboard';
import { fetchScoreboard } from '@/api/espn';
import { transformScoreboard } from '@/utils/transformers';
import { AppError } from '@/api/errors';
import type { GameData } from '@/api/types';

const mockFetch = fetchScoreboard as jest.Mock;
const mockTransform = transformScoreboard as jest.Mock;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0 },
    },
    logger: { log: () => {}, warn: () => {}, error: () => {} } as never,
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
}

const fakeGame: GameData = {
  id: 'g1',
  sport: 'football',
  league: 'nfl',
  status: 'live',
  statusText: 'Q2 5:00',
  startTime: '2024-01-15T20:00:00Z',
  broadcasts: ['ESPN'],
  homeTeam: { id: 'h', abbreviation: 'KC', displayName: 'Chiefs', logo: '', score: '14', winner: false },
  awayTeam: { id: 'a', abbreviation: 'BUF', displayName: 'Bills', logo: '', score: '10', winner: false },
};

beforeEach(() => {
  mockFetch.mockReset();
  mockTransform.mockReset();
});

describe('useScoreboard', () => {
  it('returns data on successful fetch', async () => {
    mockFetch.mockResolvedValueOnce({ events: [] });
    mockTransform.mockReturnValueOnce([fakeGame]);

    const { result } = renderHook(() => useScoreboard('football', 'nfl'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([fakeGame]);
    expect(mockFetch).toHaveBeenCalledWith('football', 'nfl');
    expect(mockTransform).toHaveBeenCalledWith({ events: [] }, 'football', 'nfl');
  });

  it('is initially in loading state', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useScoreboard('football', 'nfl'), {
      wrapper: makeWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('surfaces AppError on network failure (after retries exhausted)', async () => {
    const networkErr = new AppError('network', 'No connection');
    // mockRejectedValue (not Once) ensures all retry attempts also fail
    mockFetch.mockRejectedValue(networkErr);

    const { result } = renderHook(() => useScoreboard('football', 'nfl'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 10_000 });
    expect(result.current.error).toBeInstanceOf(AppError);
    expect(result.current.error?.kind).toBe('network');
  });

  it('surfaces AppError on server failure (after retries exhausted)', async () => {
    const serverErr = new AppError('server', 'ESPN is down', 500);
    mockFetch.mockRejectedValue(serverErr);

    const { result } = renderHook(() => useScoreboard('football', 'nfl'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 10_000 });
    expect(result.current.error?.kind).toBe('server');
  });

  it('surfaces AppError on 404 not_found immediately (no retries)', async () => {
    // not_found → retry returns false immediately, so Once is sufficient
    const notFoundErr = new AppError('not_found', 'No season data', 404);
    mockFetch.mockRejectedValueOnce(notFoundErr);

    const { result } = renderHook(() => useScoreboard('football', 'nfl'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('not_found');
  });

  it('does not throw on error (throwOnError: false)', async () => {
    mockFetch.mockRejectedValueOnce(new AppError('not_found', 'not found', 404));

    const { result } = renderHook(() => useScoreboard('football', 'nfl'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // Error is surfaced via result.current.error, not thrown as an exception
    expect(result.current.error).toBeDefined();
  });

  it('uses correct ESPN endpoint for soccer with sub-league', async () => {
    mockFetch.mockResolvedValueOnce({ events: [] });
    mockTransform.mockReturnValueOnce([]);

    const { result } = renderHook(() => useScoreboard('soccer', 'usa.1'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith('soccer', 'usa.1');
  });

  it('returns empty array when ESPN returns no events', async () => {
    mockFetch.mockResolvedValueOnce({ events: [] });
    mockTransform.mockReturnValueOnce([]);

    const { result } = renderHook(() => useScoreboard('football', 'nfl'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
