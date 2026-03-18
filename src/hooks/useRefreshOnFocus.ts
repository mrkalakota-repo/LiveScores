import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

export function useRefreshOnFocus(refetch: () => void) {
  const firstMount = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstMount.current) {
        firstMount.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
}
