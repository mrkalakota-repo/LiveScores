import React from 'react';
import { Text } from 'react-native';

// Lightweight stub — renders icon name as text so tests can assert on it
export const Ionicons = ({ name, testID, ...rest }: { name: string; testID?: string; [key: string]: unknown }) => (
  <Text testID={testID ?? `icon-${name}`}>{name}</Text>
);
