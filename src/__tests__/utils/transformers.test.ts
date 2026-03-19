import { transformScoreboard, groupGamesIntoSections } from '@/utils/transformers';
import type { EspnScoreboardResponse, GameData } from '@/api/types';

function makeRawResponse(overrides: Partial<EspnScoreboardResponse> = {}): EspnScoreboardResponse {
  return {
    events: [
      {
        id: 'evt1',
        date: '2024-01-15T18:00:00Z',
        name: 'Team A vs Team B',
        shortName: 'TA vs TB',
        status: {
          type: {
            id: '1',
            name: 'STATUS_FINAL',
            state: 'post',
            completed: true,
            description: 'Final',
            detail: 'Final',
            shortDetail: 'Final',
          },
        },
        competitions: [
          {
            id: 'comp1',
            date: '2024-01-15T18:00:00Z',
            venue: { fullName: 'Test Stadium' },
            broadcasts: [{ names: ['ESPN'] }],
            status: {
              type: {
                id: '1',
                name: 'STATUS_FINAL',
                state: 'post',
                completed: true,
                description: 'Final',
                detail: 'Final',
                shortDetail: 'Final',
              },
            },
            competitors: [
              {
                id: 'team1',
                homeAway: 'home',
                score: '28',
                winner: true,
                team: { id: 't1', abbreviation: 'HME', displayName: 'Home Team', logo: 'https://example.com/home.png' },
                records: [{ summary: '10-5', type: 'total' }],
              },
              {
                id: 'team2',
                homeAway: 'away',
                score: '21',
                winner: false,
                team: { id: 't2', abbreviation: 'AWY', displayName: 'Away Team', logo: '' },
                records: [{ summary: '8-7', type: 'total' }],
              },
            ],
          },
        ],
      },
    ],
    ...overrides,
  };
}

// ── transformScoreboard ────────────────────────────────────────────────────

describe('transformScoreboard', () => {
  it('maps a final game correctly', () => {
    const result = transformScoreboard(makeRawResponse(), 'football', 'nfl');
    expect(result).toHaveLength(1);
    const game = result[0];
    expect(game.id).toBe('comp1');
    expect(game.status).toBe('final');
    expect(game.statusText).toBe('Final');
    expect(game.homeTeam.abbreviation).toBe('HME');
    expect(game.homeTeam.score).toBe('28');
    expect(game.homeTeam.winner).toBe(true);
    expect(game.awayTeam.abbreviation).toBe('AWY');
    expect(game.awayTeam.winner).toBe(false);
    expect(game.broadcasts).toEqual(['ESPN']);
    expect(game.venue).toBe('Test Stadium');
  });

  it('returns empty array for empty events', () => {
    expect(transformScoreboard({ events: [] }, 'football', 'nfl')).toEqual([]);
  });

  it('skips events with missing competitions array', () => {
    const raw: EspnScoreboardResponse = {
      events: [
        { id: 'e1', date: '2024-01-15T18:00:00Z', name: 'A', shortName: 'A', status: makeRawResponse().events[0].status, competitions: [] },
        makeRawResponse().events[0],
      ],
    };
    // Only the event with a valid competition should come through
    const result = transformScoreboard(raw, 'tennis', 'atp');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('comp1');
  });

  it('skips events where competitors array lacks home or away', () => {
    const raw = makeRawResponse();
    // Remove the away competitor
    raw.events[0].competitions[0].competitors = raw.events[0].competitions[0].competitors.filter(
      c => c.homeAway === 'home',
    );
    const result = transformScoreboard(raw, 'football', 'nfl');
    expect(result).toEqual([]);
  });

  it('uses logos array fallback when logo field empty', () => {
    const raw = makeRawResponse();
    raw.events[0].competitions[0].competitors[0].team.logo = '';
    raw.events[0].competitions[0].competitors[0].team.logos = [{ href: 'https://example.com/fallback.png' }];
    const [game] = transformScoreboard(raw, 'football', 'nfl');
    expect(game.homeTeam.logo).toBe('https://example.com/fallback.png');
  });

  it('returns scheduled time text for pre-game', () => {
    const raw = makeRawResponse();
    raw.events[0].status.type.state = 'pre';
    raw.events[0].competitions[0].status.type.state = 'pre';
    const [game] = transformScoreboard(raw, 'football', 'nfl');
    expect(game.status).toBe('scheduled');
    // statusText is a formatted time string, not blank
    expect(game.statusText.length).toBeGreaterThan(0);
  });

  it('extracts situation from lastPlay', () => {
    const raw = makeRawResponse();
    raw.events[0].competitions[0].situation = {
      lastPlay: { text: 'Touchdown pass to WR' },
    };
    const [game] = transformScoreboard(raw, 'football', 'nfl');
    expect(game.situation).toBe('Touchdown pass to WR');
  });

  it('extracts overall record', () => {
    const [game] = transformScoreboard(makeRawResponse(), 'football', 'nfl');
    expect(game.homeTeam.record).toBe('10-5');
  });
});

// ── groupGamesIntoSections ────────────────────────────────────────────────

describe('groupGamesIntoSections', () => {
  const makeGame = (status: GameData['status']): GameData => ({
    id: status,
    sport: 'football',
    league: 'nfl',
    status,
    statusText: '',
    startTime: '2024-01-15T20:00:00Z',
    broadcasts: [],
    homeTeam: { id: 'h', abbreviation: 'H', displayName: 'Home', logo: '', score: '0', winner: false },
    awayTeam: { id: 'a', abbreviation: 'A', displayName: 'Away', logo: '', score: '0', winner: false },
  });

  it('creates IN PROGRESS section for live/halftime games', () => {
    const sections = groupGamesIntoSections([makeGame('live'), makeGame('halftime')]);
    expect(sections[0].title).toBe('IN PROGRESS');
    expect(sections[0].data).toHaveLength(2);
  });

  it('creates UPCOMING section for scheduled games', () => {
    const sections = groupGamesIntoSections([makeGame('scheduled')]);
    expect(sections[0].title).toBe('UPCOMING');
  });

  it('creates FINAL section for finished games', () => {
    const sections = groupGamesIntoSections([makeGame('final')]);
    expect(sections[0].title).toBe('FINAL');
  });

  it('omits empty sections', () => {
    const sections = groupGamesIntoSections([makeGame('live')]);
    expect(sections).toHaveLength(1);
    expect(sections.every(s => s.data.length > 0)).toBe(true);
  });

  it('returns empty array for no games', () => {
    expect(groupGamesIntoSections([])).toEqual([]);
  });
});
