import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
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
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={40} color={Colors.live} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
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
    gap: 12,
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.liveBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 4,
  },
  buttonPressed: { opacity: 0.75 },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
