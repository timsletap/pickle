import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Divider, Provider as PaperProvider, Text } from 'react-native-paper';

import BattingOrder from '../Lineups/BattingOrder';
import FieldView from '../Lineups/FieldView';
import PickerDialog from '../Lineups/PickerDialog';
import RosterScroller from '../Lineups/RosterScroller';
import StatsDialog from '../Lineups/StatsDialog';
import styles from '../Lineups/styles';
import { POSITIONS, SAMPLE_ROSTER } from '../Lineups/types';

export default function Lineups() {
  const [roster] = useState(SAMPLE_ROSTER);
  const [sortMode, setSortMode] = useState<'name' | 'obr' | 'bip' | 'pwr' | 'spd'>('name');
  const [viewMode, setViewMode] = useState<'defense' | 'offense'>('defense');
  const [statsDialog, setStatsDialog] = useState<{ visible: boolean; player: any }>({ visible: false, player: null });
  const [battingOrder, setBattingOrder] = useState<any[] | null>(null);

  const initialAssignments: Record<string, any> = POSITIONS.reduce((acc, p) => ({ ...acc, [p.id]: null }), {});
  const [assignments, setAssignments] = useState<Record<string, any>>(initialAssignments);
  const [dialog, setDialog] = useState<{ visible: boolean; positionId: string | null }>({ visible: false, positionId: null });

  const openPicker = (positionId: string) => setDialog({ visible: true, positionId });
  const closePicker = () => setDialog({ visible: false, positionId: null });

  const selectPlayer = (player: any) => {
    if (!dialog.positionId) return;
    setAssignments((prev) => ({ ...prev, [dialog.positionId as string]: player }));
    closePicker();
  };
  const selectNone = () => {
    if (!dialog.positionId) return;
    setAssignments((prev) => ({ ...prev, [dialog.positionId as string]: null }));
    closePicker();
  };

  const posById = (id: string) => POSITIONS.find((p) => p.id === id) as any;

  const openStats = (player: any) => setStatsDialog({ visible: true, player });
  const closeStats = () => setStatsDialog({ visible: false, player: null });

  const getMetric = (p: any, mode: string) => {
    const s = p.stats ?? {};
    const PA = s.pa ?? 0;
    const H = s.h ?? 0;
    const BB = s.bb ?? 0;
    const SO = s.so ?? 0;
    const XBH = s.xbh ?? 0;
    const ROE = s.roe ?? 0;
    const SPD = s.spd ?? 0;

    if (mode === 'obr') return PA > 0 ? (H + BB + ROE) / PA : 0;
    if (mode === 'bip') return PA > 0 ? 1 - SO / PA : 0;
    if (mode === 'pwr') return PA > 0 ? XBH / PA : 0;
    if (mode === 'spd') return SPD; // 0-10
    return 0;
  };

  const sortedRoster = [...roster].sort((a: any, b: any) => {
    if (sortMode === 'name') return a.last_name.localeCompare(b.last_name);
    if (sortMode === 'obr') return getMetric(b, 'obr') - getMetric(a, 'obr');
    if (sortMode === 'bip') return getMetric(b, 'bip') - getMetric(a, 'bip');
    if (sortMode === 'pwr') return getMetric(b, 'pwr') - getMetric(a, 'pwr');
    if (sortMode === 'spd') return getMetric(b, 'spd') - getMetric(a, 'spd');
    return 0;
  });

  return (
    <PaperProvider>
      <View style={styles.page}>
        <View style={styles.viewToggleRow}>
          <Button mode={viewMode === 'defense' ? 'contained' : 'outlined'} onPress={() => setViewMode('defense')} compact>
            Defense
          </Button>
          <Button mode={viewMode === 'offense' ? 'contained' : 'outlined'} onPress={() => setViewMode('offense')} compact style={{ marginLeft: 8 }}>
            Offense
          </Button>
        </View>

        {viewMode === 'defense' ? (
          <FieldView positions={POSITIONS} assignments={assignments} openPicker={openPicker} />
        ) : (
          <BattingOrder
            roster={roster}
            sortMode={sortMode}
            setSortMode={setSortMode}
            openStats={openStats}
            battingOrder={battingOrder ?? undefined}
            onAutoGenerate={() => {
              // lazy import algorithm to keep file clear; always brute (default)
              const { generateOptimalLineup } = require('../Lineups/LineupAlgorithm') as typeof import('../Lineups/LineupAlgorithm');
              const result = generateOptimalLineup(roster, { lineupSize: Math.min(9, roster.length), strategy: 'brute' });
              setBattingOrder(result.lineup);
            }}
            onClearOrder={() => setBattingOrder(null)}
          />
        )}

        <Divider style={{ marginVertical: 12 }} />

        <View style={styles.rosterContainer}>
          <Text variant="titleMedium" style={{ marginBottom: 6 }}>Players</Text>
          <View style={styles.sortRow}>
            <Button mode={sortMode === 'name' ? 'contained' : 'outlined'} onPress={() => setSortMode('name')} compact>
              Name
            </Button>
            <Button mode={sortMode === 'obr' ? 'contained' : 'outlined'} onPress={() => setSortMode('obr')} compact style={{ marginLeft: 8 }}>
              OBR
            </Button>
            <Button mode={sortMode === 'bip' ? 'contained' : 'outlined'} onPress={() => setSortMode('bip')} compact style={{ marginLeft: 8 }}>
              BIP
            </Button>
            <Button mode={sortMode === 'pwr' ? 'contained' : 'outlined'} onPress={() => setSortMode('pwr')} compact style={{ marginLeft: 8 }}>
              PWR
            </Button>
            <Button mode={sortMode === 'spd' ? 'contained' : 'outlined'} onPress={() => setSortMode('spd')} compact style={{ marginLeft: 8 }}>
              SPD
            </Button>
          </View>

          <RosterScroller sortedRoster={sortedRoster} metricMode={sortMode} assignments={assignments} posById={posById} openStats={openStats} />
        </View>

        <PickerDialog visible={dialog.visible} positionId={dialog.positionId} closePicker={closePicker} roster={roster} assignments={assignments} selectNone={selectNone} selectPlayer={selectPlayer} posById={posById} />

        <StatsDialog visible={statsDialog.visible} player={statsDialog.player} closeStats={closeStats} />

      </View>
    </PaperProvider>
  );
}
