import React from 'react';
import { render } from '@testing-library/react-native';
import { StatusBadge } from '@/components/StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    const { getByText } = render(<StatusBadge status="live" statusText="Q2 5:30" />);
    expect(getByText('Q2 5:30')).toBeTruthy();
  });

  it('renders live status with a pulsing dot', () => {
    const { UNSAFE_getAllByType } = render(<StatusBadge status="live" statusText="LIVE" />);
    // Animated.View should include at least the dot + outer View
    const { Animated } = require('react-native');
    const animatedViews = UNSAFE_getAllByType(Animated.View);
    expect(animatedViews.length).toBeGreaterThan(0);
  });

  it('renders halftime badge', () => {
    const { getByText } = render(<StatusBadge status="halftime" statusText="Halftime" />);
    expect(getByText('Halftime')).toBeTruthy();
  });

  it('renders final badge', () => {
    const { getByText } = render(<StatusBadge status="final" statusText="Final" />);
    expect(getByText('Final')).toBeTruthy();
  });

  it('renders scheduled badge with time', () => {
    const { getByText } = render(<StatusBadge status="scheduled" statusText="7:30 PM ET" />);
    expect(getByText('7:30 PM ET')).toBeTruthy();
  });
});
