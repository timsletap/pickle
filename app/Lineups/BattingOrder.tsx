import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import styles, { colors } from './styles';
import type { Player } from './types';

type Props = {
  roster: Player[];
  sortMode: 'name' | 'ba' | 'obp' | 'slg' | 'rbi' | 'games' | 'qab';
  setSortMode: (m: 'name' | 'ba' | 'obp' | 'slg' | 'rbi' | 'games' | 'qab') => void;
  openStats: (p: Player) => void;
  battingOrder?: Player[];
  onAutoGenerate?: () => void;
  onClearOrder?: () => void;
};

export default function BattingOrder({ roster, sortMode, setSortMode, openStats, battingOrder, onAutoGenerate, onClearOrder }: Props) {
  const displayList = battingOrder ?? roster.slice().sort((a, b) => a.last_name.localeCompare(b.last_name));

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
              <View style={styles.battingPlayerInfo}>
                <Text style={styles.battingPlayerName}>{p.first_name} {p.last_name}</Text>
                <Text style={styles.battingPlayerStats}>
                  #{p.jersey ?? '-'} — RCV {p.stats?.rcv?.toFixed(2) ?? '-'}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primaryBorder} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
