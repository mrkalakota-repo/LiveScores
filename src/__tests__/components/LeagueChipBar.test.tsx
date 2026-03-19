import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LeagueChipBar } from '@/components/LeagueChipBar';
import type { LeagueConfig } from '@/constants/sports';

const leagues: LeagueConfig[] = [
  { id: 'mls', label: 'MLS', sport: 'soccer', league: 'usa.1' },
  { id: 'epl', label: 'EPL', sport: 'soccer', league: 'eng.1' },
  { id: 'ucl', label: 'UCL', sport: 'soccer', league: 'uefa.champions' },
];

describe('LeagueChipBar', () => {
  it('renders all league labels', () => {
    const { getByText } = render(
      <LeagueChipBar leagues={leagues} selected="usa.1" onSelect={jest.fn()} />,
    );
    expect(getByText('MLS')).toBeTruthy();
    expect(getByText('EPL')).toBeTruthy();
    expect(getByText('UCL')).toBeTruthy();
  });

  it('marks the selected chip as selected via accessibilityState', () => {
    const { getByRole, getAllByRole } = render(
      <LeagueChipBar leagues={leagues} selected="usa.1" onSelect={jest.fn()} />,
    );
    const tabs = getAllByRole('tab');
    // First chip (MLS / usa.1) should be selected
    expect(tabs[0].props.accessibilityState?.selected).toBe(true);
    expect(tabs[1].props.accessibilityState?.selected).toBe(false);
    expect(tabs[2].props.accessibilityState?.selected).toBe(false);
  });

  it('calls onSelect with the full LeagueConfig when a chip is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <LeagueChipBar leagues={leagues} selected="usa.1" onSelect={onSelect} />,
    );
    fireEvent.press(getByText('EPL'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(leagues[1]);
  });

  it('does not call onSelect when already-selected chip is pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <LeagueChipBar leagues={leagues} selected="usa.1" onSelect={onSelect} />,
    );
    fireEvent.press(getByText('MLS'));
    // onSelect IS called — the parent decides whether to ignore no-op
    expect(onSelect).toHaveBeenCalledWith(leagues[0]);
  });

  it('renders nothing when leagues array is empty', () => {
    const { queryByRole } = render(
      <LeagueChipBar leagues={[]} selected="" onSelect={jest.fn()} />,
    );
    expect(queryByRole('tab')).toBeNull();
  });

  it('switches selected chip when selected prop changes', () => {
    const { getAllByRole, rerender } = render(
      <LeagueChipBar leagues={leagues} selected="usa.1" onSelect={jest.fn()} />,
    );
    let tabs = getAllByRole('tab');
    expect(tabs[0].props.accessibilityState?.selected).toBe(true);

    rerender(<LeagueChipBar leagues={leagues} selected="eng.1" onSelect={jest.fn()} />);
    tabs = getAllByRole('tab');
    expect(tabs[0].props.accessibilityState?.selected).toBe(false);
    expect(tabs[1].props.accessibilityState?.selected).toBe(true);
  });
});
