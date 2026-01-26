import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Player } from '../types';
import styles, { colors } from './styles';

import { useAuth } from '../auth-context';
import { fetchPlayerInfo } from '../realtimeDb';

import { useEffect, useState } from 'react';

type Props = {
  sortedRoster: Player[];
  metricMode?: 'name' | 'tc' | 'etc' | 'a' | 'dp' | 'po' | 'innings';
  assignments: Record<string, Player | null>;
  posById: (id: string) => { id: string; label: string; name: string };
  openStats: (p: Player) => void;
};

export default function RosterScroller({ sortedRoster, metricMode = 'name', assignments, posById, openStats }: Props) {
  const { user } = useAuth();

  const [players, setPlayers] = useState<Record<string, Player>>({});

  useEffect(() => {
    if (!user) {
      setPlayers({});
      return;
    }
    const unsub = fetchPlayerInfo(user.uid, (data) => {
      if (!data) {
        setPlayers({});
        return;
      }
      const mapped: Record<string, Player> = {};
      Object.entries(data).forEach(([id, val]) => {
        const v = val as any;
        mapped[id] = {
          id,
          name: v.name,
          positions: v.positions || [],
          jerseyNumber: v.jerseyNumber ?? undefined,
          stats: v.stats ?? {},
          statsDefensive: v.statsDefensive ?? {},
        };
      });
      setPlayers(mapped);
    });
    return () => unsub && unsub();
  }, [user]);
  
  const getMetric = (p: Player, mode: string) => {
    const pData = players[p.id ?? ''];
    const s = (pData?.statsDefensive) ?? {} as Record<string, any>;

    if (mode === 'tc') return s.tc ?? 0;
    if (mode === 'etc') return s.etc ?? 0;
    if (mode === 'a') return s.a ?? 0;
    if (mode === 'dp') return s.dp ?? 0;
    if (mode === 'po') return s.po ?? 0;
    if (mode === 'innings') return s.innings ?? 0;

    return 0;
  };

  const renderMetric = (p: Player) => {
    const val = getMetric(p, metricMode ?? 'name');
    const formatted = (metricMode === 'dp' || metricMode === 'po' || metricMode === 'a' || metricMode === 'tc' || metricMode === 'etc' || metricMode === 'innings')
      ? `${Math.round(val ?? 0)}`
      : `${(val ?? 0).toFixed(2)}`;
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
        const displayName = (p.name ?? '').trim() || '-';
        return (
          <View key={p.id} style={styles.playerCard}>
            <Text style={styles.playerName} numberOfLines={1}>
              {displayName}
            </Text>
            <Pressable
              onPress={() => openStats(p)}
              style={({ pressed }) => [styles.playerIcon, pressed && styles.pressed]}
            >
              <Text style={styles.playerNumber}>{p.jersey ?? p.jerseyNumber ?? '-'}</Text>
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
