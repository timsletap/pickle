import { Pressable, Text, View } from 'react-native';
import { colors } from './styles';
import type { Player, Position } from './types';

type Props = {
  positions: Position[];
  assignments: Record<string, Player | null>;
  openPicker: (positionId: string) => void;
};

export default function FieldView({ positions, assignments, openPicker }: Props) {
  return (
    <View style={{
      width: '100%',
      aspectRatio: 1.1,
      maxWidth: 380,
      alignSelf: 'center',
      marginHorizontal: 16,
      borderRadius: 20,
      backgroundColor: '#0d1a0d',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Outfield arc glow */}
      <View style={{
        position: 'absolute',
        top: '5%',
        left: '10%',
        right: '10%',
        height: '50%',
        borderWidth: 2,
        borderColor: colors.primary,
        borderTopLeftRadius: 200,
        borderTopRightRadius: 200,
        borderBottomWidth: 0,
        opacity: 0.4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      }} />

      {/* Diamond shape */}
      <View style={{
        position: 'absolute',
        top: '35%',
        left: '25%',
        width: '50%',
        aspectRatio: 1,
        borderWidth: 2,
        borderColor: colors.primary,
        transform: [{ rotate: '45deg' }],
        opacity: 0.6,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15,
      }} />

      {/* Home to pitcher line */}
      <View style={{
        position: 'absolute',
        top: '55%',
        left: '50%',
        width: 2,
        height: '25%',
        backgroundColor: colors.primary,
        opacity: 0.3,
        marginLeft: -1,
      }} />

      {/* Position circles */}
      {positions.map((pos) => {
        const assigned = assignments[pos.id];
        const isAssigned = !!assigned;

        return (
          <View
            key={pos.id}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              alignItems: 'center',
            } as any}
          >
            <Pressable
              onPress={() => openPicker(pos.id)}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isAssigned ? 'rgba(0, 168, 120, 0.2)' : 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: isAssigned ? colors.primary : 'rgba(0, 168, 120, 0.4)',
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isAssigned ? 0.8 : 0.3,
                shadowRadius: isAssigned ? 12 : 6,
                elevation: 4,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Text style={{
                fontWeight: '800',
                color: isAssigned ? colors.primary : 'rgba(255, 255, 255, 0.8)',
                fontSize: isAssigned ? 15 : 12,
              }}>
                {assigned ? `${assigned.jersey ?? ''}` : pos.label}
              </Text>
            </Pressable>

            <Text
              style={{
                marginTop: 4,
                fontSize: 9,
                textAlign: 'center',
                color: isAssigned ? colors.primary : 'rgba(255, 255, 255, 0.6)',
                fontWeight: '600',
                maxWidth: 70,
              }}
              numberOfLines={1}
            >
              {assigned ? `${assigned.first_name ?? ''} ${(assigned.last_name ?? '')[0] ? `${(assigned.last_name ?? '')[0]}.` : ''}`.trim() : pos.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
