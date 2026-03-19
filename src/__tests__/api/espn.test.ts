/**
 * fetchScoreboard tests
 *
 * axios.create is called twice (espnClient + espnWebClient); the factory
 * returns a single shared instance so both clients use the same get spy.
 */
jest.mock('axios', () => {
  const mockInstance = { get: jest.fn() };
  return { create: jest.fn(() => mockInstance) };
});

import axios from 'axios';
import { fetchScoreboard } from '@/api/espn';
import { AppError } from '@/api/errors';

// Grab the shared mock get from the shared instance
const mockGet = (axios.create() as unknown as { get: jest.Mock }).get;

beforeEach(() => {
  mockGet.mockReset();
});

// ── Input validation ─────────────────────────────────────────────────────

describe('fetchScoreboard — input validation', () => {
  it('rejects unsupported sport', async () => {
    await expect(fetchScoreboard('badminton', 'league1')).rejects.toThrow('Unsupported sport');
  });

  it('rejects path traversal in league slug', async () => {
    await expect(fetchScoreboard('football', '../../../etc/passwd')).rejects.toThrow(
      'Invalid league identifier',
    );
  });

  it('rejects shell metacharacters in league slug', async () => {
    await expect(fetchScoreboard('football', 'nfl;rm -rf')).rejects.toThrow(
      'Invalid league identifier',
    );
  });

  it('rejects URL-encoded characters in league slug', async () => {
    await expect(fetchScoreboard('football', 'nfl%2F..')).rejects.toThrow(
      'Invalid league identifier',
    );
  });
});

// ── Happy path ───────────────────────────────────────────────────────────

describe('fetchScoreboard — happy path', () => {
  it('calls the correct ESPN endpoint and returns data', async () => {
    mockGet.mockResolvedValueOnce({ data: { events: [] } });
    const result = await fetchScoreboard('football', 'nfl');
    expect(result).toEqual({ events: [] });
    expect(mockGet).toHaveBeenCalledWith('/football/nfl/scoreboard');
  });

  it('accepts league slugs with dots (e.g. usa.1)', async () => {
    mockGet.mockResolvedValueOnce({ data: { events: [] } });
    await expect(fetchScoreboard('soccer', 'usa.1')).resolves.toEqual({ events: [] });
    expect(mockGet).toHaveBeenCalledWith('/soccer/usa.1/scoreboard');
  });

  it('routes cricket to the web API endpoint', async () => {
    mockGet.mockResolvedValueOnce({ data: { events: [] } });
    const result = await fetchScoreboard('cricket', '8048');
    expect(result).toEqual({ events: [] });
    expect(mockGet).toHaveBeenCalledWith('/site/v2/sports/cricket/8048/scoreboard');
  });

  it('accepts all valid sports', async () => {
    const validSports = ['football', 'basketball', 'baseball', 'hockey', 'soccer', 'tennis', 'cricket'];
    for (const sport of validSports) {
      mockGet.mockResolvedValueOnce({ data: { events: [] } });
      await expect(fetchScoreboard(sport, 'test')).resolves.toBeDefined();
    }
  });
});

// ── Error handling ───────────────────────────────────────────────────────

describe('fetchScoreboard — error handling', () => {
  it('wraps network errors as AppError with kind=network', async () => {
    mockGet.mockRejectedValueOnce({ request: {}, message: 'Network Error' });
    const err = await fetchScoreboard('football', 'nfl').catch(e => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err.kind).toBe('network');
  });

  it('wraps timeout errors as AppError with kind=timeout', async () => {
    mockGet.mockRejectedValueOnce({ code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' });
    const err = await fetchScoreboard('football', 'nfl').catch(e => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err.kind).toBe('timeout');
  });

  it('wraps 404 responses as AppError with kind=not_found', async () => {
    mockGet.mockRejectedValueOnce({ response: { status: 404 }, message: 'Not Found' });
    const err = await fetchScoreboard('football', 'nfl').catch(e => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err.kind).toBe('not_found');
    expect(err.statusCode).toBe(404);
  });

  it('wraps 500 responses as AppError with kind=server', async () => {
    mockGet.mockRejectedValueOnce({ response: { status: 500 }, message: 'Server Error' });
    const err = await fetchScoreboard('football', 'nfl').catch(e => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err.kind).toBe('server');
  });
});
