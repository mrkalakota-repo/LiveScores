import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { LiveGamesProvider, useLiveGames } from '@/contexts/LiveGamesContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LiveGamesProvider>{children}</LiveGamesProvider>
);

describe('LiveGamesContext', () => {
  it('starts with empty liveCounts', () => {
    const { result } = renderHook(() => useLiveGames(), { wrapper });
    expect(result.current.liveCounts).toEqual({});
  });

  it('setLiveCount adds a count for a sport', () => {
    const { result } = renderHook(() => useLiveGames(), { wrapper });
    act(() => {
      result.current.setLiveCount('nfl', 3);
    });
    expect(result.current.liveCounts.nfl).toBe(3);
  });

  it('setLiveCount updates an existing count', () => {
    const { result } = renderHook(() => useLiveGames(), { wrapper });
    act(() => {
      result.current.setLiveCount('nba', 2);
    });
    act(() => {
      result.current.setLiveCount('nba', 5);
    });
    expect(result.current.liveCounts.nba).toBe(5);
  });

  it('tracks multiple sports independently', () => {
    const { result } = renderHook(() => useLiveGames(), { wrapper });
    act(() => {
      result.current.setLiveCount('nfl', 4);
      result.current.setLiveCount('nba', 2);
      result.current.setLiveCount('mlb', 0);
    });
    expect(result.current.liveCounts.nfl).toBe(4);
    expect(result.current.liveCounts.nba).toBe(2);
    expect(result.current.liveCounts.mlb).toBe(0);
  });

  it('does not re-render when same count is set (referential stability)', () => {
    const { result } = renderHook(() => useLiveGames(), { wrapper });
    act(() => {
      result.current.setLiveCount('nhl', 1);
    });
    const prevCounts = result.current.liveCounts;
    act(() => {
      result.current.setLiveCount('nhl', 1); // same value
    });
    // Same object reference — no unnecessary re-render
    expect(result.current.liveCounts).toBe(prevCounts);
  });

  it('setLiveCount is stable across renders', () => {
    const { result, rerender } = renderHook(() => useLiveGames(), { wrapper });
    const firstSetLiveCount = result.current.setLiveCount;
    rerender({});
    expect(result.current.setLiveCount).toBe(firstSetLiveCount);
  });

  it('useLiveGames returns default context values outside provider', () => {
    // Without wrapping in LiveGamesProvider, defaults apply
    const { result } = renderHook(() => useLiveGames());
    expect(result.current.liveCounts).toEqual({});
    expect(typeof result.current.setLiveCount).toBe('function');
  });
});
