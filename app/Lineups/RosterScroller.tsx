import { Pressable, ScrollView, Text, View } from 'react-native';
import styles, { colors } from './styles';
import type { Player } from './types';

type Props = {
  sortedRoster: Player[];
  metricMode?: 'name' | 'obp' | 'slg' | 'ba' | 'rbi' | 'games' | 'qab';
  assignments: Record<string, Player | null>;
  posById: (id: string) => { id: string; label: string; name: string };
  openStats: (p: Player) => void;
};

export default function RosterScroller({ sortedRoster, metricMode = 'name', assignments, posById, openStats }: Props) {
  const getMetric = (p: Player, mode: string) => {
    const s = p.stats ?? {};
    const ba = Number(s.ba ?? 0);
    const obp = Number(s.obp ?? 0);
    const slg = Number(s.slg ?? 0);
    const rbi = Number(s.rbi ?? 0);
    const games = Number(s.games ?? 0);
    const qab = Number(s.qab ?? 0);

    if (mode === 'RCV') return 0.35 * obp + 0.25 * slg + 0.15 * ba + (games > 0 ? rbi / games : 0) + 0.10 * qab;
    if (mode === 'name') return ba;
    if (mode === 'ba') return ba;
    if (mode === 'obp') return obp;
    if (mode === 'slg') return slg;
    if (mode === 'rbi') return rbi;
    if (mode === 'games') return games;
    if (mode === 'qab') return qab;
    return 0;
  };

  const renderMetric = (p: Player) => {
    const val = getMetric(p, metricMode ?? 'name');
    const formatted = (metricMode === 'rbi' || metricMode === 'games')
      ? `${Math.round(val ?? 0)}`
      : `${(val ?? 0).toFixed(3)}`;
    return <Text style={styles.metricText}>{formatted}</Text>;
  };

  if (sortedRoster.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>No players on roster</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal contentContainerStyle={styles.rosterScroll} showsHorizontalScrollIndicator={false}>
      {sortedRoster.map((p) => {
        const assignedEntry = Object.entries(assignments).find(([posId, pl]) => pl?.id === p.id);
        const assignedPos = assignedEntry ? assignedEntry[0] : null;
        return (
          <View key={p.id} style={styles.playerCard}>
            <Text style={styles.playerName} numberOfLines={1}>
              {p.first_name} {p.last_name.charAt(0)}.
            </Text>
            <Pressable
              onPress={() => openStats(p)}
              style={({ pressed }) => [styles.playerIcon, pressed && styles.pressed]}
            >
              <Text style={styles.playerNumber}>{p.jersey ?? '-'}</Text>
            </Pressable>
            {renderMetric(p)}
            {assignedPos && (
              <Text style={styles.assignedText}>{posById(assignedPos).label}</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
