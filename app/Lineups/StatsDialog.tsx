import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import styles, { colors } from './styles';
import type { Player } from './types';

type Props = {
  visible: boolean;
  player: Player | null;
  closeStats: () => void;
};

export default function StatsDialog({ visible, player, closeStats }: Props) {
  if (!visible || !player) return null;

  const stats = [
    { label: 'Name', value: player.name ?? '-', icon: 'account' },
    { label: 'Jersey', value: player.jerseyNumber ?? '-', icon: 'tshirt-crew' },
    { label: 'Batting Avg', value: player.stats?.ba?.toFixed(2) ?? '-', icon: 'baseball-bat' },
    { label: 'On-Base %', value: player.stats?.obp?.toFixed(2) ?? '-', icon: 'percent' },
    { label: 'Slugging', value: player.stats?.slg?.toFixed(2) ?? '-', icon: 'flash' },
    { label: 'Games', value: player.stats?.games ?? '-', icon: 'calendar-check' },
    { label: 'QAB%', value: player.stats?.qab?.toFixed(1) ?? '-', icon: 'chart-line' },
  ];

  const initials = `${player.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '-'}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeStats}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxWidth: 360 }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { alignItems: 'center', paddingVertical: 24 }]}>
            <View style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: colors.primaryDim,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: colors.primary,
              marginBottom: 12,
            }}>
            <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '900' }}>
              {initials || '-'}
            </Text>
            </View>
            <Text style={[styles.modalSubtitle, { textAlign: 'center' }]}>
              PLAYER STATS
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={[styles.modalBody, { paddingVertical: 8 }]}>
            {stats.map((stat, index) => (
              <View key={stat.label} style={[styles.statRow, index === stats.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons
                    name={stat.icon as any}
                    size={18}
                    color={colors.textMuted}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={closeStats}
              style={[styles.actionButton, styles.actionButtonPrimary, { flex: 1 }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
