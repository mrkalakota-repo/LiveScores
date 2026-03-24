import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPORTS } from '@/constants/sports';

const STORAGE_KEY = '@livescores/sport_prefs';

// Default to first 4 sports on first launch
const DEFAULT_IDS = new Set(SPORTS.slice(0, 4).map(s => s.id));

interface SportPreferencesContextValue {
  selectedIds: Set<string>;
  toggle: (id: string) => void;
  isSelected: (id: string) => boolean;
  ready: boolean;
}

const SportPreferencesContext = createContext<SportPreferencesContextValue>({
  selectedIds: DEFAULT_IDS,
  toggle: () => {},
  isSelected: () => true,
  ready: false,
});

export function SportPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(DEFAULT_IDS);
  const [ready, setReady] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) {
        try {
          const ids: string[] = JSON.parse(stored);
          const validIds = ids.filter(id => SPORTS.some(s => s.id === id));
          if (validIds.length > 0) setSelectedIds(new Set(validIds));
        } catch {
          // corrupted storage — keep defaults
        }
      }
      setReady(true);
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      // Prevent deselecting the last sport
      if (prev.has(id) && prev.size === 1) return prev;
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const value = useMemo(
    () => ({ selectedIds, toggle, isSelected, ready }),
    [selectedIds, toggle, isSelected, ready],
  );

  return (
    <SportPreferencesContext.Provider value={value}>
      {children}
    </SportPreferencesContext.Provider>
  );
}

export const useSportPreferences = () => useContext(SportPreferencesContext);
