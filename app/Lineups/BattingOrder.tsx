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
};

export default function BattingOrder({ roster, sortMode, setSortMode, openStats, battingOrder, onAutoGenerate, onClearOrder }: Props) {
  const [posIndexMap, setPosIndexMap] = useState<Record<string, number>>({});

  const displayList = battingOrder ?? roster.slice().sort((a, b) => (a.last_name ?? '').localeCompare(b.last_name ?? ''));

  return (
    <View style={styles.battingContainer}>
      <View style={styles.battingHeader}>
        <Text style={styles.sectionTitle}>Batting Order</Text>
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
              <Text style={{ color: colors.textMuted, width: 80, fontSize: 12, fontWeight: '700' }}>Pos</Text>
              <Text style={{ color: colors.textMuted, width: 175, fontSize: 12, fontWeight: '700' }}>Name</Text>
              <Text style={{ color: colors.textMuted, width: 60, fontSize: 12, fontWeight: '700' }}>#</Text>
            </View>
          </View>

          <ScrollView style={styles.battingList} showsVerticalScrollIndicator={false}>
            {displayList.map((p: Player, index: number) => (
              <Pressable
                key={p.id}
                onPress={() => openStats(p)}
                style={({ pressed }) => [styles.battingItem, pressed && { opacity: 0.7 }]}
              >
                <View style={styles.battingIndex}>
                  <Text style={styles.battingIndexText}>{index + 1}</Text>
                </View>

                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
                  {p.positions && p.positions.length > 0 ? (
                    <Pressable
                      onPress={() => {
                        const key = String(p.id);
                        setPosIndexMap((prev) => {
                          const cur = prev[key] ?? 0;
                          const next = (cur + 1) % p.positions!.length;
                          return { ...prev, [key]: next };
                        });
                      }}
                      style={{ width: 64 }}
                    >
                      <Text style={{ color: colors.textMuted }}>
                        {String(p.positions[posIndexMap[String(p.id)] ?? 0])}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text style={{ color: colors.textMuted, width: 64 }}>-</Text>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.battingPlayerName}>{p.name ?? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()}</Text>
                  </View>
                  <Text style={{ color: colors.primary, width: 60, textAlign: 'right', fontWeight: '700' }}>{p.jersey ?? p.jerseyNumber ?? '-'}</Text>
                </View>

                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primaryBorder} />
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
