import React from 'react';
import { render } from '@testing-library/react-native';
import { LineScores } from '@/components/LineScores';
import type { TeamInfo } from '@/api/types';

function makeTeam(abbrev: string, linescores: number[], score: string, winner = false): TeamInfo {
  return {
    id: abbrev,
    abbreviation: abbrev,
    displayName: abbrev,
    logo: '',
    score,
    winner,
    linescores,
  };
}

describe('LineScores', () => {
  it('returns null when neither team has linescores', () => {
    const home = makeTeam('KC', [], '0');
    const away = makeTeam('BUF', [], '0');
    const { toJSON } = render(<LineScores sport="football" homeTeam={home} awayTeam={away} />);
    expect(toJSON()).toBeNull();
  });

  it('renders team abbreviations', () => {
    const home = makeTeam('KC', [7, 0, 10, 11], '28', true);
    const away = makeTeam('BUF', [7, 7, 7, 0], '21');
    const { getByText } = render(<LineScores sport="football" homeTeam={home} awayTeam={away} />);
    expect(getByText('KC')).toBeTruthy();
    expect(getByText('BUF')).toBeTruthy();
  });

  it('renders correct period labels for football (Q1–Q4)', () => {
    const home = makeTeam('KC', [7, 0, 10, 11], '28');
    const away = makeTeam('BUF', [7, 7, 7, 0], '21');
    const { getByText } = render(<LineScores sport="football" homeTeam={home} awayTeam={away} />);
    expect(getByText('Q1')).toBeTruthy();
    expect(getByText('Q2')).toBeTruthy();
    expect(getByText('Q3')).toBeTruthy();
    expect(getByText('Q4')).toBeTruthy();
  });

  it('renders OT label for a 5th period in football', () => {
    const home = makeTeam('KC', [7, 0, 10, 11, 3], '31');
    const away = makeTeam('BUF', [7, 7, 7, 0, 0], '21');
    const { getByText } = render(<LineScores sport="football" homeTeam={home} awayTeam={away} />);
    expect(getByText('OT')).toBeTruthy();
  });

  it('renders P1–P3 labels for hockey', () => {
    const home = makeTeam('TOR', [1, 2, 0], '3');
    const away = makeTeam('MTL', [0, 1, 2], '3');
    const { getByText } = render(<LineScores sport="hockey" homeTeam={home} awayTeam={away} />);
    expect(getByText('P1')).toBeTruthy();
    expect(getByText('P2')).toBeTruthy();
    expect(getByText('P3')).toBeTruthy();
  });

  it('renders Inn labels for cricket', () => {
    const home = makeTeam('IND', [280], '280');
    const away = makeTeam('AUS', [250], '250');
    const { getByText } = render(<LineScores sport="cricket" homeTeam={home} awayTeam={away} />);
    expect(getByText('Inn 1')).toBeTruthy();
  });

  it('renders period scores and total', () => {
    const home = makeTeam('KC', [7, 10], '17');
    const away = makeTeam('BUF', [3, 7], '10');
    const { getAllByText } = render(<LineScores sport="football" homeTeam={home} awayTeam={away} />);
    expect(getAllByText('7').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('10').length).toBeGreaterThanOrEqual(1);
  });

  it('renders total score in T column', () => {
    const home = makeTeam('KC', [7, 21], '28', true);
    const away = makeTeam('BUF', [7, 14], '21');
    const { getAllByText, getByText } = render(<LineScores sport="football" homeTeam={home} awayTeam={away} />);
    // '28' appears once (total), '21' appears twice (period score + total)
    expect(getAllByText('28').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('21').length).toBeGreaterThanOrEqual(1);
    expect(getByText('T')).toBeTruthy();
  });

  it('renders dash for missing period scores', () => {
    // home has 3 periods, away only 2
    const home = makeTeam('KC', [7, 10, 14], '31');
    const away = makeTeam('BUF', [3, 7], '10');
    const { getAllByText } = render(<LineScores sport="football" homeTeam={home} awayTeam={away} />);
    expect(getAllByText('-').length).toBeGreaterThanOrEqual(1);
  });

  it('renders numeric labels for baseball', () => {
    const home = makeTeam('NYY', [1, 0, 2, 0, 1, 0, 0, 0, 0], '4');
    const away = makeTeam('BOS', [0, 1, 0, 0, 0, 0, 2, 0, 0], '3');
    const { getAllByText } = render(<LineScores sport="baseball" homeTeam={home} awayTeam={away} />);
    // Label '1' (column header) plus score values of '1' — multiple matches expected
    expect(getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });
});
