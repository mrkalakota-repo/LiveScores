import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameCard } from '@/components/GameCard';
import type { GameData } from '@/api/types';

// Mock expo-router so GameCard can use useRouter without a navigation context
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const baseGame: GameData = {
  id: 'game1',
  sport: 'football',
  league: 'nfl',
  status: 'live',
  statusText: 'Q3 8:42',
  startTime: '2024-01-15T20:00:00Z',
  broadcasts: ['ESPN'],
  homeTeam: {
    id: 'h1',
    abbreviation: 'KC',
    displayName: 'Kansas City Chiefs',
    logo: 'https://example.com/kc.png',
    score: '17',
    winner: false,
  },
  awayTeam: {
    id: 'a1',
    abbreviation: 'BUF',
    displayName: 'Buffalo Bills',
    logo: 'https://example.com/buf.png',
    score: '14',
    winner: false,
  },
};

describe('GameCard', () => {
  it('renders both team abbreviations', () => {
    const { getByText } = render(<GameCard game={baseGame} />);
    expect(getByText('KC')).toBeTruthy();
    expect(getByText('BUF')).toBeTruthy();
  });

  it('renders status text', () => {
    const { getByText } = render(<GameCard game={baseGame} />);
    expect(getByText('Q3 8:42')).toBeTruthy();
  });

  it('renders broadcast info', () => {
    const { getByText } = render(<GameCard game={baseGame} />);
    expect(getByText('ESPN')).toBeTruthy();
  });

  it('does not render broadcast when empty', () => {
    const game = { ...baseGame, broadcasts: [] };
    const { queryByText } = render(<GameCard game={game} />);
    expect(queryByText('ESPN')).toBeNull();
  });

  it('renders situation text when provided', () => {
    const game = { ...baseGame, situation: '1st & 10 at KC 35' };
    const { getByText } = render(<GameCard game={game} />);
    expect(getByText('1st & 10 at KC 35')).toBeTruthy();
  });

  it('does not render situation when undefined', () => {
    const { queryByText } = render(<GameCard game={baseGame} />);
    expect(queryByText(/1st/)).toBeNull();
  });

  it('has accessible label combining team abbreviations', () => {
    const { getByLabelText } = render(<GameCard game={baseGame} />);
    expect(getByLabelText(/BUF vs KC/)).toBeTruthy();
  });

  it('renders a final game card', () => {
    const game: GameData = {
      ...baseGame,
      status: 'final',
      statusText: 'Final',
      homeTeam: { ...baseGame.homeTeam, score: '28', winner: true },
      awayTeam: { ...baseGame.awayTeam, score: '21', winner: false },
    };
    const { getByText } = render(<GameCard game={game} />);
    expect(getByText('Final')).toBeTruthy();
    expect(getByText('28')).toBeTruthy();
    expect(getByText('21')).toBeTruthy();
  });
});
