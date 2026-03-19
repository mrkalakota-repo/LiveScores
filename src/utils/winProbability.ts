import type { StatLine, GameStatus, WinProbability } from '@/api/types';

export type { WinProbability };

// Points/goals per unit of win-probability shift per unit of game progress
const SCORE_WEIGHT: Partial<Record<string, number>> = {
  football:   0.030,   // NFL: ~3 pts = meaningful lead
  basketball: 0.007,   // NBA: high scores, each pt worth less
  baseball:   0.055,   // MLB: each run is significant
  hockey:     0.100,   // NHL: low scoring
  soccer:     0.130,   // Similar low scoring to hockey
  // Tennis and cricket use dedicated models below
};

/** Parse "W-L" or "W-L-T" record string into a win rate [0, 1]. */
export function parseWinPct(record?: string): number | null {
  if (!record) return null;
  const parts = record.split('-').map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return null;
  const [w, l, t = 0] = parts;
  const total = w + l + t;
  if (total === 0) return null;
  return (w + 0.5 * t) / total;
}

/** Estimate how far through the game we are [0, 1] from the status text. */
export function estimateProgress(statusText: string, sport: string): number {
  const text = statusText.toUpperCase();
  if (text.includes('OT') || text.includes('OVERTIME')) return 1.0;
  if (text.includes('HALF') || text === 'HT') return 0.5;

  // Quarter sports (NFL, NBA): "Q1" … "Q4"
  const qMatch = text.match(/Q(\d)/);
  if (qMatch) {
    const q = parseInt(qMatch[1], 10);
    return Math.min((q - 0.5) / 4, 0.95);
  }

  // Period sports (NHL): "1ST", "2ND", "3RD"
  const periodMap: Record<string, number> = { '1ST': 1, '2ND': 2, '3RD': 3 };
  for (const [word, num] of Object.entries(periodMap)) {
    if (text.includes(word)) {
      const totalPeriods = sport === 'hockey' ? 3 : 3;
      return Math.min((num - 0.5) / totalPeriods, 0.95);
    }
  }

  // Cricket: overs notation e.g. "15.2 OV", "20 OVERS"
  if (sport === 'cricket') {
    const oversMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:OV|OVERS?)/);
    if (oversMatch) {
      const overs = parseFloat(oversMatch[1]);
      const maxOvers = text.includes('50') ? 50 : 20; // infer T20 vs ODI
      return Math.min(overs / maxOvers, 0.95);
    }
    // Innings pattern: "INN 1", "INNINGS 2"
    const innMatch = text.match(/INN(?:INGS?)?\s*(\d+)/);
    if (innMatch) {
      return Math.min((parseInt(innMatch[1], 10) - 0.5) / 2, 0.95);
    }
  }

  // Tennis: set patterns "2ND SET", "3RD SET"
  if (sport === 'tennis') {
    const setMatch = text.match(/(\d+)(?:ST|ND|RD|TH)\s*SET/);
    if (setMatch) {
      const setNum = parseInt(setMatch[1], 10);
      return Math.min((setNum - 0.5) / 3, 0.95); // assume BO3
    }
  }

  // Inning sports (baseball): "1ST", "2ND" … "9TH"
  const inningMatch = text.match(/(\d+)(ST|ND|RD|TH)/);
  if (inningMatch) {
    const inning = parseInt(inningMatch[1], 10);
    return Math.min((inning - 0.5) / 9, 0.95);
  }

  return 0.5;
}

/** Count completed set wins from per-set game scores. */
function countTennisSets(homeGames: number[], awayGames: number[]) {
  let homeW = 0, awayW = 0;
  for (let i = 0; i < Math.max(homeGames.length, awayGames.length); i++) {
    const h = homeGames[i] ?? 0;
    const a = awayGames[i] ?? 0;
    // A set is complete when: (max score ≥ 6 AND lead ≥ 2) OR (tiebreak: max = 7)
    const maxVal = Math.max(h, a);
    if ((maxVal >= 6 && Math.abs(h - a) >= 2) || maxVal === 7) {
      if (h > a) homeW++;
      else awayW++;
    }
  }
  return { homeW, awayW };
}

/** Shared record-based component (used by tennis + cricket scheduled). */
function recordBasedProb(homeRecord?: string, awayRecord?: string): WinProbability | null {
  const homePct = parseWinPct(homeRecord);
  const awayPct = parseWinPct(awayRecord);
  if (homePct === null || awayPct === null) return null;
  const total = homePct + awayPct;
  if (total === 0) return null;
  const homeProb = homePct / total;
  return { home: clamp(homeProb), away: clamp(1 - homeProb), basis: 'record' };
}

/** Tennis win probability from sets won or per-set game scores. */
function computeTennisWinProbability(params: {
  homeScore: string;
  awayScore: string;
  homeRecord?: string;
  awayRecord?: string;
  status: GameStatus;
  statusText: string;
}): WinProbability | null {
  const { homeScore, awayScore, homeRecord, awayRecord, status } = params;
  if (status === 'final') return null;
  if (status === 'scheduled') return recordBasedProb(homeRecord, awayRecord);

  // Detect format: "2" (sets won, from summary API) vs "6 3 7" (games per set, from scoreboard)
  const homeParts = homeScore.split(' ').map(Number).filter(n => !isNaN(n));
  const awayParts = awayScore.split(' ').map(Number).filter(n => !isNaN(n));
  if (homeParts.length === 0) return null;

  let homeSets = 0, awaySets = 0, currentSetAdv = 0;

  if (homeParts.length === 1 && awayParts.length === 1) {
    // Sets-won format (e.g. "2" vs "1")
    homeSets = homeParts[0];
    awaySets = awayParts[0];
  } else {
    // Games-per-set format (e.g. "6 3 7" vs "4 7 5")
    const { homeW, awayW } = countTennisSets(homeParts, awayParts);
    homeSets = homeW;
    awaySets = awayW;
    // Add signal from the ongoing (last) set
    const lastH = homeParts[homeParts.length - 1] ?? 0;
    const lastA = awayParts[awayParts.length - 1] ?? 0;
    const lastTotal = lastH + lastA;
    if (lastTotal > 0) {
      currentSetAdv = (lastH / lastTotal - 0.5) * 0.08;
    }
  }

  // Each set lead ≈ 22% advantage
  let homeAdv = (homeSets - awaySets) * 0.22 + currentSetAdv;

  // Small record component
  const homePct = parseWinPct(homeRecord);
  const awayPct = parseWinPct(awayRecord);
  if (homePct !== null && awayPct !== null && homePct + awayPct > 0) {
    homeAdv += (homePct / (homePct + awayPct) - 0.5) * 0.12;
  }

  const hasSets = homeSets + awaySets > 0;
  return {
    home: clamp(0.5 + homeAdv),
    away: clamp(0.5 - homeAdv),
    basis: hasSets ? 'score' : (homePct !== null ? 'record' : 'even'),
  };
}

/** Cricket win probability from run differential and game progress. */
function computeCricketWinProbability(params: {
  homeScore: string;
  awayScore: string;
  homeRecord?: string;
  awayRecord?: string;
  status: GameStatus;
  statusText: string;
}): WinProbability | null {
  const { homeScore, awayScore, homeRecord, awayRecord, status, statusText } = params;
  if (status === 'final') return null;
  if (status === 'scheduled') return recordBasedProb(homeRecord, awayRecord);

  const h = parseFloat(homeScore);
  const a = parseFloat(awayScore);
  if (isNaN(h) || isNaN(a)) return null;

  const progress = estimateProgress(statusText, 'cricket');
  const scoreDiff = h - a;

  // Runs are high-value (T20 total ~320, each run ~0.003 of probability)
  let homeAdv = scoreDiff * 0.003 * (0.3 + 0.7 * progress);

  // Record component (decays with progress)
  const homePct = parseWinPct(homeRecord);
  const awayPct = parseWinPct(awayRecord);
  if (homePct !== null && awayPct !== null && homePct + awayPct > 0) {
    homeAdv += (homePct / (homePct + awayPct) - 0.5) * (1 - progress) * 0.20;
  }

  return {
    home: clamp(0.5 + homeAdv),
    away: clamp(0.5 - homeAdv),
    basis: Math.abs(scoreDiff) > 0 ? 'score' : (homePct !== null ? 'record' : 'even'),
  };
}

/** Extract a numeric stat value by matching a label regex. */
function extractStatValue(stats: StatLine[], pattern: RegExp): number | null {
  const found = stats.find(s => pattern.test(s.label));
  if (!found) return null;
  const val = parseFloat(found.value.replace(/[^0-9.]/g, ''));
  return isNaN(val) ? null : val;
}

/**
 * Compute win probability for both teams from available game data.
 * Returns null when there is not enough data to produce a meaningful estimate
 * (e.g. final games, or scheduled games with no records).
 */
export function computeWinProbability(params: {
  homeScore: string;
  awayScore: string;
  homeRecord?: string;
  awayRecord?: string;
  homeStats: StatLine[];
  awayStats: StatLine[];
  status: GameStatus;
  statusText: string;
  sport: string;
}): WinProbability | null {
  const { homeScore, awayScore, homeRecord, awayRecord,
          homeStats, awayStats, status, statusText, sport } = params;

  // Don't show for completed games — the scoreline already tells the story
  if (status === 'final') return null;

  // ── Sport-specific models ─────────────────────────────────────────────────
  if (sport === 'tennis') {
    return computeTennisWinProbability({ homeScore, awayScore, homeRecord, awayRecord, status, statusText });
  }
  if (sport === 'cricket') {
    return computeCricketWinProbability({ homeScore, awayScore, homeRecord, awayRecord, status, statusText });
  }

  // ── Scheduled: record-based only ─────────────────────────────────────────
  if (status === 'scheduled') {
    const homePct = parseWinPct(homeRecord);
    const awayPct = parseWinPct(awayRecord);
    if (homePct === null || awayPct === null) return null;
    const total = homePct + awayPct;
    if (total === 0) return null;
    const homeProb = homePct / total;
    return {
      home: clamp(homeProb),
      away: clamp(1 - homeProb),
      basis: 'record',
    };
  }

  // ── Live / halftime ───────────────────────────────────────────────────────
  const h = parseFloat(homeScore);
  const a = parseFloat(awayScore);
  if (isNaN(h) || isNaN(a)) return null;

  const weight = SCORE_WEIGHT[sport];
  // Sports whose scoring structure can't be mapped linearly
  if (weight === undefined || weight === 0) return null;

  const scoreDiff = h - a;   // positive → home leading
  const progress = status === 'halftime'
    ? 0.5
    : estimateProgress(statusText, sport);

  // Score component: more weight as game progresses
  let homeAdv = scoreDiff * weight * (0.3 + 0.7 * progress);

  // Record component: decays as game progresses
  const homePct = parseWinPct(homeRecord);
  const awayPct = parseWinPct(awayRecord);
  if (homePct !== null && awayPct !== null) {
    const total = homePct + awayPct;
    if (total > 0) {
      const recordAdv = homePct / total - 0.5;
      homeAdv += recordAdv * (1 - progress) * 0.25;
    }
  }

  // Stats component: total yards (football), shots (hockey/soccer)
  const homeYards = extractStatValue(homeStats, /total.*yard|yard/i);
  const awayYards = extractStatValue(awayStats, /total.*yard|yard/i);
  if (homeYards !== null && awayYards !== null) {
    const yardTotal = homeYards + awayYards;
    if (yardTotal > 0) {
      homeAdv += (homeYards / yardTotal - 0.5) * 0.12 * (1 - progress);
    }
  }

  const homeShots = extractStatValue(homeStats, /shots?/i);
  const awayShots = extractStatValue(awayStats, /shots?/i);
  if (homeShots !== null && awayShots !== null) {
    const shotTotal = homeShots + awayShots;
    if (shotTotal > 0) {
      homeAdv += (homeShots / shotTotal - 0.5) * 0.10 * (1 - progress);
    }
  }

  return {
    home: clamp(0.5 + homeAdv),
    away: clamp(0.5 - homeAdv),
    basis: 'score',
  };
}

function clamp(p: number): number {
  return Math.round(Math.max(0.05, Math.min(0.95, p)) * 100);
}
