import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { Player } from '../types';
import styles, { colors } from './styles';

type Props = {
  roster: Player[];
  sortMode: 'name' | 'tc' | 'etc' | 'a' | 'dp' | 'po' | 'innings';
  setSortMode: (m: 'name' | 'tc' | 'etc' | 'a' | 'dp' | 'po' | 'innings') => void;
  openStats: (p: Player) => void;
  battingOrder?: Player[];
  onAutoGenerate?: () => void;
  onClearOrder?: () => void;
  selectedBatSlot?: number | null;
  setSelectedBatSlot?: (i: number | null) => void;
};

export default function BattingOrder({ roster, sortMode, setSortMode, openStats, battingOrder, onAutoGenerate, onClearOrder, selectedBatSlot, setSelectedBatSlot }: Props) {
  const [posIndexMap, setPosIndexMap] = useState<Record<string, number>>({});

  const displayList = (battingOrder ?? roster.slice().sort((a, b) => (a.last_name ?? '').localeCompare(b.last_name ?? ''))) as (Player | null)[];

  return (
    <View style={styles.battingContainer}>
      <View style={styles.battingHeader}>
        <Text style={[styles.sectionTitle, { paddingTop: 20 }]}>Batting Order</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => onAutoGenerate && onAutoGenerate()}
            style={[styles.actionButton, styles.actionButtonPrimary]}
            activeOpacity={0.8}
          >
          <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>Auto-generate</Text>
          </TouchableOpacity>
          {onClearOrder && (
            <TouchableOpacity
              onPress={onClearOrder}
              style={[styles.actionButton, styles.actionButtonSecondary]}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {displayList.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <MaterialCommunityIcons name="baseball-bat" size={40} color={colors.primaryDim} />
          <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 12 }}>No players to display</Text>
        </View>
      ) : (
        <>
          {/* Column headers to mimic a physical lineup card */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' }}>
            <View style={{ width: 40 }} />
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, width: 15, fontSize: 12, fontWeight: '700' }}></Text>
              <Text style={{ color: colors.textMuted, width: 45, fontSize: 12, fontWeight: '700' }}>Pos</Text>
              <Text style={{ color: colors.textMuted, width: 120, fontSize: 12, fontWeight: '700' }}>Name</Text>
              <Text style={{ color: colors.textMuted, width: 60, fontSize: 12, fontWeight: '700' }}>RCV</Text>
              <View style={{ flex: 1 }} />
              <Text style={{ color: colors.textMuted, paddingRight: 40, textAlign: 'right', width: 60, fontSize: 12, fontWeight: '700' }}>#</Text>
            </View>
          </View>

          <ScrollView style={styles.battingList} showsVerticalScrollIndicator={false}>
            {displayList.map((p: Player | null, index: number) => (
              <View key={p?.id ?? `slot-${index}`} style={styles.battingItem}>
                <Pressable
                  onPress={() => setSelectedBatSlot?.(index)}
                  style={({ pressed }) => [
                    styles.battingIndex,
                    pressed && { opacity: 0.8 },
                    selectedBatSlot === index && { backgroundColor: colors.primaryDim },
                  ]}
                >
                  <Text style={styles.battingIndexText}>{index + 1}</Text>
                </Pressable>

                <Pressable
                  onPress={() => p ? openStats(p) : null}
                  style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }, pressed && p && { opacity: 0.7 }]}
                >
                  {p && p.positions && p.positions.length > 0 ? (
                    <Pressable
                      onPress={() => {
                        const key = String(p.id);
                        setPosIndexMap((prev) => {
                          const cur = prev[key] ?? 0;
                          const next = (cur + 1) % p.positions!.length;
                          return { ...prev, [key]: next };
                        });
                      }}
                        style={{ width: 45 }}
                    >
                      <Text style={{ color: colors.textMuted }}>
                        {String(p.positions[posIndexMap[String(p.id)] ?? 0])}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text style={{ color: colors.textMuted, width: 45 }}>{p ? '-' : ''}</Text>
                  )}
                  <View style={{ width: 90 }}>
                    <Text style={[styles.battingPlayerName, { flexWrap: 'wrap' }]}>{p ? (p.name ?? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()) : '—'}</Text>
                  </View>
                  <Text style={{ color: colors.primary, width: 60, textAlign: 'right', fontWeight: '700' }}>
                    {p ? (Number.isFinite(Number(p.stats?.rcv)) ? Number(p.stats!.rcv).toFixed(2) : '-') : '-'}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text style={{ color: colors.primary, paddingRight: 0, textAlign: 'right', fontWeight: '700' }}>{p ? (p.jersey ?? p.jerseyNumber ?? '-') : '-'}</Text>

                  <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primaryBorder} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
