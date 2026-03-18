import React, { createContext, useCallback, useContext, useState } from 'react';

type LiveCounts = Record<string, number>;

interface LiveGamesContextValue {
  liveCounts: LiveCounts;
  setLiveCount: (sportId: string, count: number) => void;
}

const LiveGamesContext = createContext<LiveGamesContextValue>({
  liveCounts: {},
  setLiveCount: () => {},
});

export function LiveGamesProvider({ children }: { children: React.ReactNode }) {
  const [liveCounts, setLiveCounts] = useState<LiveCounts>({});

  const setLiveCount = useCallback((sportId: string, count: number) => {
    setLiveCounts(prev => {
      if (prev[sportId] === count) return prev;
      return { ...prev, [sportId]: count };
    });
  }, []);

  return (
    <LiveGamesContext.Provider value={{ liveCounts, setLiveCount }}>
      {children}
    </LiveGamesContext.Provider>
  );
}

export function useLiveGames() {
  return useContext(LiveGamesContext);
}
