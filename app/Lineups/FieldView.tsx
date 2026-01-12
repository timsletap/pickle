import React from 'react';
import { Pressable, Text, View } from 'react-native';
import styles from './styles';
import type { Player, Position } from './types';

type Props = {
  positions: Position[];
  assignments: Record<string, Player | null>;
  openPicker: (positionId: string) => void;
};

export default function FieldView({ positions, assignments, openPicker }: Props) {
  return (
    <View style={styles.field}>
      {positions.map((pos) => {
        const assigned = assignments[pos.id];
        return (
          <View key={pos.id} style={{ position: 'absolute', top: pos.top, left: pos.left, alignItems: 'center' } as any}>
            <Pressable
              onPress={() => openPicker(pos.id)}
              style={({ pressed }) => [styles.positionCircle, pressed ? styles.pressed : null]}
            >
              <Text style={styles.circleText}>{assigned ? `${assigned.jersey ?? ''}` : pos.label}</Text>
            </Pressable>

            <Text style={styles.posLabel}>{assigned ? `${assigned.first_name} ${assigned.last_name}` : pos.name}</Text>
          </View>
        );
      })}
    </View>
  );
}
