import React from 'react';
import { Image as RNImage } from 'react-native';

// Stub expo-image with React Native's built-in Image
export const Image = ({ source, style, testID }: { source: unknown; style?: unknown; testID?: string }) => (
  <RNImage source={source as any} style={style as any} testID={testID} />
);
