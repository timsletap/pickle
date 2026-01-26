import { View } from 'react-native';
import FieldView from '../Lineups/FieldView';

type Props = {
  positions: any;
  assignments: Record<string, any>;
  openPicker: (positionId: string) => void;
};

export default function LineupsDefense({ positions, assignments, openPicker }: Props) {
  return (
    <View style={{ paddingTop: 16 }}>
      <FieldView positions={positions} assignments={assignments} openPicker={openPicker} />
    </View>
  );
}
