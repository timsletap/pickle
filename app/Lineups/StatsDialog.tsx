import React from 'react';
import { Button, Dialog, List } from 'react-native-paper';
import type { Player } from './types';

type Props = {
  visible: boolean;
  player: Player | null;
  closeStats: () => void;
};

export default function StatsDialog({ visible, player, closeStats }: Props) {
  return (
    <Dialog visible={visible} onDismiss={closeStats}>
      <Dialog.Title>{player ? `${player.first_name} ${player.last_name}` : ''}</Dialog.Title>
      <Dialog.Content>
        <List.Item title={`Jersey: ${player?.jersey ?? '-'}`} />
        <List.Item title={`AVG: ${player?.stats ? player.stats.avg.toFixed(3) : '-'}`} />
        <List.Item title={`Hits: ${player?.stats?.hits ?? '-'}`} />
        <List.Item title={`RBI: ${player?.stats?.rbi ?? '-'}`} />
        <List.Item title={`Games: ${player?.stats?.games ?? '-'}`} />
        <List.Item title={`OBP: ${player?.stats?.obp ?? '-'}`} />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={closeStats}>Close</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
