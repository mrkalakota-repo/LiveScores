import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorScreen } from '@/components/ErrorScreen';
import { AppError } from '@/api/errors';

describe('ErrorScreen', () => {
  it('renders default message when no error passed', () => {
    const { getByText } = render(<ErrorScreen onRetry={jest.fn()} />);
    expect(getByText('Could not load scores')).toBeTruthy();
  });

  it('renders network-specific message', () => {
    const { getByText } = render(
      <ErrorScreen onRetry={jest.fn()} error={new AppError('network', 'No internet')} />,
    );
    expect(getByText('No Internet Connection')).toBeTruthy();
    expect(getByText('Check your network and try again.')).toBeTruthy();
  });

  it('renders timeout-specific message', () => {
    const { getByText } = render(
      <ErrorScreen onRetry={jest.fn()} error={new AppError('timeout', 'Timed out')} />,
    );
    expect(getByText('Request Timed Out')).toBeTruthy();
  });

  it('renders not_found-specific message', () => {
    const { getByText } = render(
      <ErrorScreen onRetry={jest.fn()} error={new AppError('not_found', 'Not found')} />,
    );
    expect(getByText('Not Available')).toBeTruthy();
  });

  it('renders server-specific message', () => {
    const { getByText } = render(
      <ErrorScreen onRetry={jest.fn()} error={new AppError('server', 'Server error', 503)} />,
    );
    expect(getByText('Service Unavailable')).toBeTruthy();
  });

  it('calls onRetry when Try Again is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorScreen onRetry={onRetry} />);
    fireEvent.press(getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has accessible retry button', () => {
    const { getByRole } = render(<ErrorScreen onRetry={jest.fn()} />);
    expect(getByRole('button', { name: 'Retry loading scores' })).toBeTruthy();
  });
});
