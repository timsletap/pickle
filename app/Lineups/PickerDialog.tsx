import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import styles, { colors } from './styles';
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
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closePicker}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Player</Text>
            <Text style={styles.modalSubtitle}>
              {positionId ? posById(positionId).name : ''}
            </Text>
          </View>

          {/* Body */}
          <ScrollView style={[styles.modalBody, { maxHeight: 400 }]}>
            {/* Clear selection option */}
            <Pressable
              onPress={selectNone}
              style={({ pressed }) => [styles.listItem, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.listItemIcon, { backgroundColor: 'rgba(255, 100, 100, 0.2)' }]}>
                <MaterialCommunityIcons name="close-circle-outline" size={22} color="#ff6b6b" />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>No selection</Text>
                <Text style={styles.listItemDescription}>Leave this position empty</Text>
              </View>
            </Pressable>

            {/* Player list */}
            {roster.map((player) => {
              const assignedEntry = Object.entries(assignments).find(([posId, p]) => p?.id === player.id);
              const assignedPosId = assignedEntry ? assignedEntry[0] : null;
              const isAssignedElsewhere = !!assignedPosId && assignedPosId !== positionId;
              const assignedPosName = isAssignedElsewhere ? posById(assignedPosId).name : null;

              return (
                <Pressable
                  key={player.id}
                  onPress={() => {
                    if (!isAssignedElsewhere) selectPlayer(player);
                  }}
                  style={({ pressed }) => [
                    styles.listItem,
                    isAssignedElsewhere && styles.listItemDisabled,
                    pressed && !isAssignedElsewhere && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.listItemIcon}>
                    <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 14 }}>
                      {player.jersey ?? '-'}
                    </Text>
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>
                      {player.first_name} {player.last_name}
                    </Text>
                    <Text style={styles.listItemDescription}>
                      {isAssignedElsewhere ? `Assigned to ${assignedPosName}` : `#${player.jersey ?? '-'}`}
                    </Text>
                  </View>
                  {!isAssignedElsewhere && (
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primaryBorder} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={closePicker}
              style={[styles.actionButton, styles.actionButtonSecondary]}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
