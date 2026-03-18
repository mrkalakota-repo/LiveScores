import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyState } from '@/components/EmptyState';

describe('EmptyState', () => {
  it('renders "No Games Today" title', () => {
    const { getByText } = render(<EmptyState />);
    expect(getByText('No Games Today')).toBeTruthy();
  });

  it('shows generic subtitle when no sport given', () => {
    const { getByText } = render(<EmptyState />);
    expect(getByText('Check back later for live scores.')).toBeTruthy();
  });

  it('shows sport-specific subtitle when sport is provided', () => {
    const { getByText } = render(<EmptyState sport="NFL" />);
    expect(getByText(/NFL/)).toBeTruthy();
  });
});
