import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styles from './styles';
import type { Player } from './types';

type Props = {
  sortedRoster: Player[];
  metricMode?: 'name' | 'obr' | 'bip' | 'pwr' | 'spd';
  assignments: Record<string, Player | null>;
  posById: (id: string) => { id: string; label: string; name: string };
  openStats: (p: Player) => void;
};

export default function RosterScroller({ sortedRoster, metricMode = 'name', assignments, posById, openStats }: Props) {
  const getMetric = (p: Player, mode: string) => {
    const s = p.stats ?? {};
    const PA = s.pa ?? 0;
    const H = s.h ?? 0;
    const BB = s.bb ?? 0;
    const SO = s.so ?? 0;
    const XBH = s.xbh ?? 0;
    const ROE = s.roe ?? 0;
    const SPD = s.spd ?? 0;

    if (mode === 'obr') return PA > 0 ? (H + BB + ROE) / PA : 0;
    if (mode === 'bip') return PA > 0 ? 1 - SO / PA : 0;
    if (mode === 'pwr') return PA > 0 ? XBH / PA : 0;
    if (mode === 'spd') return SPD; // 0-10
    // name -> show AVG
    return s.avg ?? 0;
  };

  const renderMetric = (p: Player) => {
    const val = getMetric(p, metricMode ?? 'name');
    const label = metricMode === 'name' ? 'AVG' : metricMode?.toUpperCase();
    const formatted = metricMode === 'spd' ? `${Math.round(val)}` : `${(val ?? 0).toFixed(3)}`;
    return <Text style={{ fontSize: 11, color: '#333', marginTop: 4 }}>{label}: {formatted}</Text>;
  };

  return (
    <ScrollView horizontal contentContainerStyle={styles.rosterScroll} showsHorizontalScrollIndicator={false}>
      {sortedRoster.map((p) => {
        const assignedEntry = Object.entries(assignments).find(([posId, pl]) => pl?.id === p.id);
        const assignedPos = assignedEntry ? assignedEntry[0] : null;
        return (
          <View key={p.id} style={styles.playerCard}>
            <Pressable onPress={() => openStats(p)} style={({ pressed }) => [styles.playerIcon, pressed ? styles.pressed : null]}>
              <Text style={styles.playerNumber}>{p.jersey ?? ''}</Text>
            </Pressable>
            <Text style={styles.playerName} numberOfLines={1}>{p.last_name}</Text>
            {renderMetric(p)}
            {assignedPos ? <Text style={styles.assignedText}>{posById(assignedPos).label}</Text> : null}
          </View>
        );
      })}
    </ScrollView>
  );
}
