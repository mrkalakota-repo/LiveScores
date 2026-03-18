import React from 'react';
import { render } from '@testing-library/react-native';
import { TeamRow } from '@/components/TeamRow';
import type { TeamInfo } from '@/api/types';

const baseTeam: TeamInfo = {
  id: 't1',
  abbreviation: 'NE',
  displayName: 'New England Patriots',
  logo: 'https://example.com/ne.png',
  score: '28',
  winner: false,
};

describe('TeamRow', () => {
  it('renders team abbreviation', () => {
    const { getByText } = render(
      <TeamRow team={baseTeam} isWinner={false} gameStatus="final" />,
    );
    expect(getByText('NE')).toBeTruthy();
  });

  it('shows score for final games', () => {
    const { getByText } = render(
      <TeamRow team={baseTeam} isWinner={false} gameStatus="final" />,
    );
    expect(getByText('28')).toBeTruthy();
  });

  it('shows "--" for scheduled games', () => {
    const { getByText } = render(
      <TeamRow team={baseTeam} isWinner={false} gameStatus="scheduled" />,
    );
    expect(getByText('--')).toBeTruthy();
  });

  it('shows record when provided', () => {
    const team = { ...baseTeam, record: '10-5' };
    const { getByText } = render(
      <TeamRow team={team} isWinner={false} gameStatus="final" />,
    );
    expect(getByText('10-5')).toBeTruthy();
  });

  it('does not show record when undefined', () => {
    const team = { ...baseTeam, record: undefined };
    const { queryByText } = render(
      <TeamRow team={team} isWinner={false} gameStatus="final" />,
    );
    expect(queryByText(/\d+-\d+/)).toBeNull();
  });

  it('renders logo placeholder initial when logo is empty', () => {
    const team = { ...baseTeam, logo: '' };
    const { getByText } = render(
      <TeamRow team={team} isWinner={false} gameStatus="live" />,
    );
    // Should show first character of abbreviation as placeholder
    expect(getByText('N')).toBeTruthy();
  });
});
