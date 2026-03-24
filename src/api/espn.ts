import axios from 'axios';
import { ESPN_BASE_URL, ESPN_WEB_BASE_URL } from '@/constants/config';
import { classifyError } from './errors';
import type { EspnScoreboardResponse, EspnSummaryResponse } from './types';
import type { LeagueConfig } from '@/constants/sports';

// Allowlist of valid sport slugs to prevent path injection
const VALID_SPORTS = new Set([
  'football', 'basketball', 'baseball', 'hockey',
  'soccer', 'tennis', 'cricket',
]);

export const espnClient = axios.create({
  baseURL: ESPN_BASE_URL,
  timeout: 10_000,
});

// Cricket lives on a different subdomain
const espnWebClient = axios.create({
  baseURL: ESPN_WEB_BASE_URL,
  timeout: 10_000,
});

/**
 * Fetch active cricket leagues for today from the ESPN scoreboard header.
 * Cricket uses site.web.api.espn.com with numeric league IDs.
 */
export async function fetchCricketLeagues(): Promise<LeagueConfig[]> {
  try {
    const { data } = await espnWebClient.get('/v2/scoreboard/header', {
      params: { sport: 'cricket' },
    });
    const sport = (data.sports ?? [])[0];
    if (!sport) return [];
    return (sport.leagues ?? []).map((l: {
      id: string; name: string; shortName?: string; shortAlternateName?: string; slug?: string;
    }) => ({
      id: l.id,
      label: l.shortAlternateName ?? l.shortName ?? l.name,
      sport: 'cricket',
      league: l.id,
    }));
  } catch (err) {
    throw classifyError(err);
  }
}

export async function fetchScoreboard(
  sport: string,
  league: string,
): Promise<EspnScoreboardResponse> {
  if (!VALID_SPORTS.has(sport)) {
    throw new Error(`Unsupported sport: ${sport}`);
  }
  // Only allow alphanumeric, dots, underscores, and hyphens in league slug
  if (!/^[a-z0-9][a-z0-9.\-]*$/i.test(league)) {
    throw new Error(`Invalid league identifier: ${league}`);
  }

  try {
    // Cricket uses a different ESPN subdomain with numeric league IDs
    if (sport === 'cricket') {
      const { data } = await espnWebClient.get<EspnScoreboardResponse>(
        `/site/v2/sports/cricket/${league}/scoreboard`,
      );
      return data;
    }
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
  if (!/^[a-z0-9][a-z0-9.\-]*$/i.test(league)) {
    throw new Error(`Invalid league identifier: ${league}`);
  }
  // Event IDs from ESPN are numeric strings
  if (!/^\d+$/.test(eventId)) {
    throw new Error(`Invalid event identifier: ${eventId}`);
  }

  try {
    // Cricket uses a different ESPN subdomain
    if (sport === 'cricket') {
      const { data } = await espnWebClient.get<EspnSummaryResponse>(
        `/site/v2/sports/cricket/${league}/summary`,
        { params: { event: eventId } },
      );
      return data;
    }
    const { data } = await espnClient.get<EspnSummaryResponse>(
      `/${sport}/${league}/summary`,
      { params: { event: eventId } },
    );
    return data;
  } catch (err) {
    throw classifyError(err);
  }
}
