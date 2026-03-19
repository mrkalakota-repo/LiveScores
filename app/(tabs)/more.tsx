import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useSportPreferences } from '@/contexts/SportPreferencesContext';
import { useLiveGames } from '@/contexts/LiveGamesContext';
import { SPORTS } from '@/constants/sports';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function MoreScreen() {
  const router = useRouter();
  const { C } = useTheme();
  const { isSelected } = useSportPreferences();
  const { liveCounts } = useLiveGames();

  const hiddenSports = SPORTS.filter(s => !isSelected(s.id));

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>MORE SPORTS</Text>
      <View style={styles.list}>
        {hiddenSports.map(sport => {
          const liveCount = liveCounts[sport.id] ?? 0;
          return (
            <Pressable
              key={sport.id}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => router.navigate(`/(tabs)/${sport.id}` as any)}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${sport.label}`}
            >
              <View style={[styles.iconBox, { borderColor: sport.tabColor + '40' }]}>
                {sport.iconFamily === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons
                    name={sport.iconOutline as MCIName}
                    size={24}
                    color={sport.tabColor}
                  />
                ) : (
                  <Ionicons
                    name={sport.iconOutline as IoniconName}
                    size={24}
                    color={sport.tabColor}
                  />
                )}
              </View>

              <Text style={styles.label}>{sport.label}</Text>

              {liveCount > 0 && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>{liveCount} LIVE</Text>
                </View>
              )}

              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.editBtn, { borderColor: C.accent }]}
        onPress={() => router.navigate('/(tabs)/settings')}
      >
        <Ionicons name="options-outline" size={16} color={C.accent} />
        <Text style={[styles.editBtnText, { color: C.accent }]}>Customize sports in Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginBottom: 12,
    marginLeft: 4,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowPressed: {
    opacity: 0.75,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.liveBackground,
    borderWidth: 1,
    borderColor: Colors.liveBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.live,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.live,
    letterSpacing: 0.4,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
