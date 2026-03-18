import axios from 'axios';
import { ESPN_BASE_URL } from '@/constants/config';
import { classifyError } from './errors';
import type { EspnScoreboardResponse, EspnSummaryResponse } from './types';

// Allowlist of valid sport slugs to prevent path injection
const VALID_SPORTS = new Set([
  'football', 'basketball', 'baseball', 'hockey',
  'soccer', 'tennis', 'cricket',
]);

export const espnClient = axios.create({
  baseURL: ESPN_BASE_URL,
  timeout: 10_000,
});

export async function fetchScoreboard(
  sport: string,
  league: string,
): Promise<EspnScoreboardResponse> {
  if (!VALID_SPORTS.has(sport)) {
    throw new Error(`Unsupported sport: ${sport}`);
  }
  // Only allow alphanumeric, dots, underscores, and hyphens in league slug
  if (!/^[\w.\-]+$/.test(league)) {
    throw new Error(`Invalid league identifier: ${league}`);
  }

  try {
    const { data } = await espnClient.get<EspnScoreboardResponse>(
      `/${sport}/${league}/scoreboard`,
    );
    return data;
  } catch (err) {
    throw classifyError(err);
  }
}

export async function fetchGameSummary(
  sport: string,
  league: string,
  eventId: string,
): Promise<EspnSummaryResponse> {
  if (!VALID_SPORTS.has(sport)) {
    throw new Error(`Unsupported sport: ${sport}`);
  }
  if (!/^[\w.\-]+$/.test(league)) {
    throw new Error(`Invalid league identifier: ${league}`);
  }
  // Event IDs from ESPN are numeric strings
  if (!/^\d+$/.test(eventId)) {
    throw new Error(`Invalid event identifier: ${eventId}`);
  }

  try {
    const { data } = await espnClient.get<EspnSummaryResponse>(
      `/${sport}/${league}/summary`,
      { params: { event: eventId } },
    );
    return data;
  } catch (err) {
    throw classifyError(err);
  }
}
