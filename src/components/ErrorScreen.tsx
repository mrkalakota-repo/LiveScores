import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import type { AppError } from '@/api/errors';

interface Props {
  onRetry: () => void;
  error?: AppError | Error | null;
}

function resolveDisplay(error?: AppError | Error | null): { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; subtitle: string } {
  if (!error) {
    return { icon: 'alert-circle-outline', title: 'Could not load scores', subtitle: 'Something went wrong.' };
  }
  const kind = (error as AppError).kind;
  switch (kind) {
    case 'network':
      return { icon: 'wifi-outline', title: 'No Internet Connection', subtitle: 'Check your network and try again.' };
    case 'timeout':
      return { icon: 'time-outline', title: 'Request Timed Out', subtitle: 'The server took too long to respond.' };
    case 'not_found':
      return { icon: 'search-outline', title: 'Not Available', subtitle: 'Scores for this sport are not available right now.' };
    case 'server':
      return { icon: 'cloud-offline-outline', title: 'Service Unavailable', subtitle: 'ESPN is temporarily down. Try again shortly.' };
    default:
      return { icon: 'alert-circle-outline', title: 'Something Went Wrong', subtitle: error.message || 'Please try again.' };
  }
}

export function ErrorScreen({ onRetry, error }: Props) {
  const { C } = useTheme();
  const { icon, title, subtitle } = resolveDisplay(error);

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: C.liveBackground }]}>
        <Ionicons name={icon} size={40} color={C.live} />
      </View>
      <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: C.textSecondary }]}>{subtitle}</Text>
      <Pressable
        style={({ pressed }) => [styles.button, { backgroundColor: C.accent }, pressed && styles.buttonPressed]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading scores"
      >
        <Ionicons name="refresh-outline" size={16} color="#fff" />
        <Text style={styles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.75 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
