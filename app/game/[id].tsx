import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useGameSummary } from '@/hooks/useGameSummary';
import { GameDetailHeader } from '@/components/GameDetailHeader';
import { LineScores } from '@/components/LineScores';

export default function GameDetailScreen() {
  const router = useRouter();
  const { id, sport, league } = useLocalSearchParams<{
    id: string;
    sport: string;
    league: string;
  }>();

  const { data, isLoading, isError, error, refetch } = useGameSummary(
    sport ?? '',
    league ?? '',
    id ?? '',
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  return (
    <View style={styles.screen}>
      {/* Custom back header */}
      <View style={styles.navBar}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          <Text style={styles.backLabel}>Scores</Text>
        </Pressable>
        <Text style={styles.navTitle}>
          {sport ? sport.charAt(0).toUpperCase() + sport.slice(1) : 'Game'}
        </Text>
        <Pressable onPress={refetch} style={styles.refreshBtn} hitSlop={12}>
          <Ionicons name="refresh-outline" size={20} color={Colors.accent} />
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading game details…</Text>
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={44} color={Colors.live} />
          <Text style={styles.errorTitle}>Could not load game details</Text>
          <Text style={styles.errorSub}>{(error as any)?.message ?? 'Please try again.'}</Text>
          <Pressable style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {data && !isLoading && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Score header */}
          <GameDetailHeader
            homeTeam={data.homeTeam}
            awayTeam={data.awayTeam}
            status={data.status}
            statusText={data.statusText}
          />

          {/* Line scores */}
          {(data.homeTeam.linescores?.length ?? 0) > 0 && (
            <View style={styles.card}>
              <LineScores
                sport={sport ?? ''}
                homeTeam={data.homeTeam}
                awayTeam={data.awayTeam}
              />
            </View>
          )}

          {/* Game info */}
          {(data.venue || data.broadcasts.length > 0) && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>GAME INFO</Text>
              {data.venue && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.infoText}>{data.venue}</Text>
                </View>
              )}
              {data.broadcasts.length > 0 && (
                <View style={styles.infoRow}>
                  <Ionicons name="tv-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.infoText}>{data.broadcasts.join(' · ')}</Text>
                </View>
              )}
            </View>
          )}

          {/* Team stats */}
          {(data.homeStats.length > 0 || data.awayStats.length > 0) && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>TEAM STATS</Text>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTeamLabel}>{data.awayTeam.abbreviation}</Text>
                <View style={styles.statsFlex} />
                <Text style={styles.statsTeamLabel}>{data.homeTeam.abbreviation}</Text>
              </View>
              {data.homeStats.map((stat, i) => {
                const awayStat = data.awayStats[i];
                return (
                  <View key={stat.label} style={styles.statRow}>
                    <Text style={styles.statValue}>{awayStat?.value ?? '—'}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Player stats */}
          {data.playerLines.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>PLAYER STATS</Text>
              {(() => {
                // Group lines by category
                const cats = [...new Set(data.playerLines.map(p => p.category))].filter(Boolean);
                return cats.map(cat => {
                  const players = data.playerLines.filter(p => p.category === cat);
                  const labels = players[0]?.stats.map(s => s.label) ?? [];
                  return (
                    <View key={cat} style={styles.playerGroup}>
                      <View style={styles.playerCatHeader}>
                        <Text style={styles.playerCatLabel}>{cat?.toUpperCase()}</Text>
                        <View style={styles.playerStatLabels}>
                          {labels.map(lbl => (
                            <Text key={lbl} style={styles.playerColHeader}>{lbl}</Text>
                          ))}
                        </View>
                      </View>
                      {players.map((player, i) => (
                        <View key={player.id} style={[styles.playerRow, i > 0 && styles.playerBorder]}>
                          <View style={styles.playerNameWrap}>
                            <View style={[styles.playerTeamBadge,
                              player.teamAbbrev === data.homeTeam.abbreviation
                                ? styles.playerTeamHome : styles.playerTeamAway]}>
                              <Text style={styles.playerTeamText}>{player.teamAbbrev}</Text>
                            </View>
                            {player.jersey && (
                              <Text style={styles.playerJersey}>#{player.jersey}</Text>
                            )}
                            <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
                          </View>
                          <View style={styles.playerStatValues}>
                            {player.stats.map(s => (
                              <Text key={s.label} style={styles.playerStatVal}>{s.value}</Text>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                });
              })()}
            </View>
          )}

          {/* Recent plays */}
          {data.recentPlays.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>RECENT PLAYS</Text>
              {data.recentPlays.map((play, i) => (
                <View key={play.id} style={[styles.playRow, i > 0 && styles.playBorder]}>
                  <View style={styles.playMeta}>
                    {play.clock && (
                      <Text style={styles.playClock}>{play.clock}</Text>
                    )}
                    {play.team && (
                      <View style={[styles.playTeamBadge, play.isScore && styles.playScoreBadge]}>
                        <Text style={[styles.playTeamText, play.isScore && styles.playScoreText]}>
                          {play.team}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.playText} numberOfLines={3}>{play.text}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomPad} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 70,
  },
  backLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  refreshBtn: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorTitle: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statsTeamLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
    width: 52,
  },
  statsFlex: { flex: 1 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statValue: {
    width: 52,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'left',
  },
  statLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  playRow: {
    gap: 6,
    paddingVertical: 10,
  },
  playBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  playMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playClock: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  playTeamBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: Colors.surfaceElevated,
  },
  playScoreBadge: {
    backgroundColor: Colors.scheduledBackground,
    borderWidth: 1,
    borderColor: Colors.scheduledBorder,
  },
  playTeamText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  playScoreText: {
    color: Colors.scheduled,
  },
  playText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  bottomPad: { height: 20 },
  // ── Player Stats ──────────────────────────────────────────────────────────
  playerGroup: {
    marginBottom: 12,
  },
  playerCatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 2,
  },
  playerCatLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.accent,
  },
  playerStatLabels: {
    flexDirection: 'row',
    gap: 2,
  },
  playerColHeader: {
    width: 44,
    textAlign: 'right',
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  playerBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  playerNameWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  playerTeamBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  playerTeamHome: {
    backgroundColor: Colors.scheduledBackground,
    borderColor: Colors.scheduledBorder,
  },
  playerTeamAway: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
  },
  playerTeamText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  playerJersey: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    width: 28,
  },
  playerName: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  playerStatValues: {
    flexDirection: 'row',
    gap: 2,
  },
  playerStatVal: {
    width: 44,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
