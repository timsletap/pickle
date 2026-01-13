import { Text } from 'react-native';
import { List } from 'react-native-paper';
import type { Player } from './types';

type Props = {
  players: Player[];
  selectedStat: string | null;
  openStatsEditor: (p: Player) => void;
  statKeyMap: Record<string, string>;
};

export default function StatsList({ players, selectedStat, openStatsEditor, statKeyMap }: Props) {
  return (
    <List.Section>
      {players.map((p) => (
        <List.Item
          key={p.id}
          title={p.name}
          description={(p.positions || []).join(', ') + (p.jerseyNumber != null ? `  #${p.jerseyNumber}` : '')}
          left={(props) => <List.Icon {...props} icon="account" />}
          onPress={() => openStatsEditor(p)}
          right={() => {
            if (!selectedStat) return null;
            if (selectedStat === 'none') return <Text>-</Text>;
            const sk = statKeyMap[selectedStat];
            const raw = p.stats && p.stats[sk] != null ? Number(p.stats[sk]) : 0;
            if (selectedStat === 'avg' || selectedStat === 'obp' || selectedStat === 'slg') {
              return <Text style={{ alignSelf: 'center', marginRight: 8 }}>{raw.toFixed(3)}</Text>;
            }
            if (selectedStat === 'qab') {
              return <Text style={{ alignSelf: 'center', marginRight: 8 }}>{raw.toFixed(1)}%</Text>;
            }
            return <Text style={{ alignSelf: 'center', marginRight: 8 }}>{Math.round(raw)}</Text>;
          }}
        />
      ))}
    </List.Section>
  );
}
