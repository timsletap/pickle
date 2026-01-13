import { useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Checkbox, List, Text } from 'react-native-paper';

type Props = {
  selectedStat: string | null;
  onSelectStat: (k: string) => void;
  clear: () => void;
};

export default function FilterSheet({ selectedStat, onSelectStat, clear }: Props) {
  const sheetHeight = 320;
  const sheetAnim = useRef(new Animated.Value(sheetHeight)).current;
  const [open, setOpen] = useState(false);

  const openSheet = () => {
    setOpen(true);
    Animated.timing(sheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  };
  const closeSheet = () => {
    Animated.timing(sheetAnim, { toValue: sheetHeight, duration: 180, useNativeDriver: true }).start(() => setOpen(false));
  };

  const toggle = (k: string) => {
    onSelectStat(k);
  };

  return (
    <>
      <TouchableOpacity style={styles.toggle} onPress={() => (open ? closeSheet() : openSheet())} accessibilityLabel="Toggle filters">
        <Text style={styles.arrow}>{open ? '↓' : '↑'}</Text>
      </TouchableOpacity>

      {open ? <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeSheet} /> : null}

      <Animated.View pointerEvents={open ? 'auto' : 'none'} style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }] }>
        <View style={styles.handleRow}>
          <Text style={{ fontWeight: '600' }}>Filter Players</Text>
          <Button compact onPress={clear}>Clear</Button>
        </View>
        <List.Item title="Batting Average (BA)" onPress={() => toggle('avg')} left={() => <Checkbox status={selectedStat === 'avg' ? 'checked' : 'unchecked'} />} />
        <List.Item title="On-Base % (OBP)" onPress={() => toggle('obp')} left={() => <Checkbox status={selectedStat === 'obp' ? 'checked' : 'unchecked'} />} />
        <List.Item title="Slugging % (SLG)" onPress={() => toggle('slg')} left={() => <Checkbox status={selectedStat === 'slg' ? 'checked' : 'unchecked'} />} />
        <List.Item title="RBI" onPress={() => toggle('rbi')} left={() => <Checkbox status={selectedStat === 'rbi' ? 'checked' : 'unchecked'} />} />
        <List.Item title="Games" onPress={() => toggle('games')} left={() => <Checkbox status={selectedStat === 'games' ? 'checked' : 'unchecked'} />} />
        <List.Item title="Quality At-Bat % (QAB%)" onPress={() => toggle('qab')} left={() => <Checkbox status={selectedStat === 'qab' ? 'checked' : 'unchecked'} />} />
        <List.Item title="None (no stats set)" onPress={() => toggle('none')} left={() => <Checkbox status={selectedStat === 'none' ? 'checked' : 'unchecked'} />} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  toggle: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    zIndex: 40,
  },
  arrow: { fontSize: 22, fontWeight: '700' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 320,
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    elevation: 6,
    zIndex: 20,
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 10,
  },
  handleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
});
