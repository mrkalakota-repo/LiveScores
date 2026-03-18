import type { EspnStatus, GameStatus } from '@/api/types';

export function getGameStatus(status: EspnStatus): GameStatus {
  const state = status.type?.state;
  const detail = status.type?.detail ?? '';
  if (state === 'post') return 'final';
  if (state === 'pre') return 'scheduled';
  if (!state) return 'scheduled';
  // in-progress: check for halftime / innings break / tea break
  const detailLower = detail.toLowerCase();
  if (
    detailLower.includes('half') ||
    detailLower.includes('halftime') ||
    detailLower.includes('break') ||
    detailLower.includes('tea') ||
    detailLower.includes('lunch')
  ) return 'halftime';
  return 'live';
}

export function getStatusText(status: EspnStatus, sport: string): string {
  const state = status.type?.state;
  const detail = status.type?.detail ?? '';
  const shortDetail = status.type?.shortDetail ?? '';

  if (state === 'post') return 'Final';
  if (state === 'pre') return shortDetail || detail;

  // Sport-specific live formatting
  switch (sport) {
    case 'baseball':
    case 'tennis':
    case 'cricket':
      // These sports use their own rich status strings from ESPN
      return shortDetail || detail;
    case 'soccer': {
      const clock = status.displayClock ?? status.clock?.toString() ?? '';
      return clock ? `${clock}'` : shortDetail || detail;
    }
  }

  // football, basketball, hockey — show period + clock
  const clock = status.displayClock ?? '';
  const period = status.period ?? 0;
  if (!clock || !period) return shortDetail || detail;

  return `${getPeriodLabel(sport, period)} ${clock}`;
}

export function getPeriodLabel(sport: string, period: number): string {
  switch (sport) {
    case 'football':
      return `Q${period}`;
    case 'basketball':
      return period > 4 ? `OT${period - 4}` : `Q${period}`;
    case 'hockey':
      return period > 3 ? 'OT' : `P${period}`;
    case 'cricket':
      return `Inn ${period}`;
    default:
      return `${period}`;
  }
}
