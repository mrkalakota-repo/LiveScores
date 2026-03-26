import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/** Design baseline width (iPhone 14 / standard phone) */
const BASE_WIDTH = 375;

/** Breakpoints for device classification */
const TABLET_MIN_WIDTH = 600;
const LARGE_TABLET_MIN_WIDTH = 900;

export interface ResponsiveInfo {
  /** Screen width in dp */
  width: number;
  /** Screen height in dp */
  height: number;
  /** True when width >= 600dp */
  isTablet: boolean;
  /** True when width > height */
  isLandscape: boolean;
  /** Number of card columns for list grids */
  columns: number;
  /** Scale factor relative to 375dp base — use for proportional sizing */
  scale: (size: number) => number;
  /** Max content width for centering on large screens */
  maxContentWidth: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isTablet = width >= TABLET_MIN_WIDTH;
    const isLandscape = width > height;
    const isLargeTablet = width >= LARGE_TABLET_MIN_WIDTH;

    // Columns: 1 on phone, 2 on tablet, 3 on large tablet landscape
    let columns = 1;
    if (isLargeTablet) {
      columns = isLandscape ? 3 : 2;
    } else if (isTablet) {
      columns = 2;
    }

    // Scale proportionally from the 375dp base, clamped to avoid extreme sizes
    const scaleFactor = Math.min(Math.max(width / BASE_WIDTH, 0.85), 1.5);
    const scale = (size: number) => Math.round(size * scaleFactor);

    // Max content width: unconstrained on phones, capped on larger screens
    const maxContentWidth = isTablet ? 600 : width;

    return { width, height, isTablet, isLandscape, columns, scale, maxContentWidth };
  }, [width, height]);
}
