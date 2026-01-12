import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button, List, Text } from 'react-native-paper';
import styles from './styles';
import type { Player } from './types';

type Props = {
  roster: Player[]; // unfiltered roster used for default batting order (name-sorted)
  sortMode: 'name' | 'obr' | 'bip' | 'pwr' | 'spd';
  setSortMode: (m: 'name' | 'obr' | 'bip' | 'pwr' | 'spd') => void;
  openStats: (p: Player) => void;
  battingOrder?: Player[];
  onAutoGenerate?: () => void;
  onClearOrder?: () => void;
};

export default function BattingOrder({ roster, sortMode, setSortMode, openStats, battingOrder, onAutoGenerate, onClearOrder }: Props) {
  const displayList = battingOrder ?? roster.slice().sort((a, b) => a.last_name.localeCompare(b.last_name));

  return (
    <View style={styles.battingContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="titleMedium" style={{ marginBottom: 6 }}>Batting Order</Text>
      </View>


      <ScrollView style={styles.battingList}>
        {displayList.map((p: Player, index: number) => (
          <List.Item
            key={p.id}
            title={`${index + 1}. ${p.first_name} ${p.last_name}`}
            description={`#${p.jersey ?? '-'} — AVG ${p.stats?.avg?.toFixed(3) ?? '-'}`}
            onPress={() => openStats(p)}
            left={(props) => <List.Icon {...props} icon="account" />}
          />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
        <Button mode="outlined" compact onPress={() => onAutoGenerate && onAutoGenerate()}>
          Auto-generate
        </Button>
        {onClearOrder ? (
          <Button compact style={{ marginLeft: 8 }} onPress={onClearOrder}>
            Clear
          </Button>
        ) : null}
      </View>
    </View>
  );
}
