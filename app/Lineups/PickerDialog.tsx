import React from 'react';
import { ScrollView } from 'react-native';
import { Button, Dialog, List } from 'react-native-paper';
import type { Player } from './types';

type Props = {
  visible: boolean;
  positionId: string | null;
  closePicker: () => void;
  roster: Player[];
  assignments: Record<string, Player | null>;
  selectNone: () => void;
  selectPlayer: (p: Player) => void;
  posById: (id: string) => { id: string; label: string; name: string };
};

export default function PickerDialog({ visible, positionId, closePicker, roster, assignments, selectNone, selectPlayer, posById }: Props) {
  return (
    <Dialog visible={visible} onDismiss={closePicker}>
      <Dialog.Title>
        Select player for {positionId ? posById(positionId).name : ''}
      </Dialog.Title>
      <Dialog.Content>
        <ScrollView style={{ maxHeight: 300 }}>
          <List.Item
            title="No selection (leave empty)"
            description="Unassign this position"
            onPress={selectNone}
            left={(props) => <List.Icon {...props} icon="close-circle-outline" />}
          />

          {roster.map((player) => {
            const assignedEntry = Object.entries(assignments).find(([posId, p]) => p?.id === player.id);
            const assignedPosId = assignedEntry ? assignedEntry[0] : null;
            const isAssignedElsewhere = !!assignedPosId && assignedPosId !== positionId;
            const assignedPosName = isAssignedElsewhere ? posById(assignedPosId).name : null;

            return (
              <List.Item
                key={player.id}
                title={`${player.first_name} ${player.last_name}`}
                description={isAssignedElsewhere ? `Assigned to ${assignedPosName}` : `#${player.jersey}`}
                onPress={() => {
                  if (!isAssignedElsewhere) selectPlayer(player);
                }}
                left={(props) => <List.Icon {...props} icon="account" />}
                disabled={isAssignedElsewhere}
              />
            );
          })}
        </ScrollView>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={closePicker}>Cancel</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
