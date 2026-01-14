import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Divider, Provider as PaperProvider, Text } from 'react-native-paper';

import { observePlayers, updatePlayerStats } from '../../config/FirebaseConfig';
import BattingOrder from '../Lineups/BattingOrder';
import FieldView from '../Lineups/FieldView';
import PickerDialog from '../Lineups/PickerDialog';
import RosterScroller from '../Lineups/RosterScroller';
import StatsDialog from '../Lineups/StatsDialog';
import styles from '../Lineups/styles';
import { POSITIONS, Player } from '../Lineups/types';
import { useAuth } from '../auth-context';

export default function Lineups() {
  const [roster, setRoster] = useState<Player[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setRoster([]);
      return;
    }

    const unsub = observePlayers(user.uid, (playersRecord) => {
      if (!playersRecord) {
        setRoster([]);
        return;
      }

      const players: Player[] = Object.entries(playersRecord).map(([key, value], idx) => {
        const fullName = (value.name || "").trim();
        const parts = fullName.split(/\s+/);
        const first_name = parts.shift() || "";
        const last_name = parts.join(' ');

        // Attempt to coerce numeric ids when possible, otherwise keep string keys
        const id: string | number = /^[0-9]+$/.test(key) ? parseInt(key, 10) : key;

        return {
          id,
          first_name,
          last_name,
          jersey: value.jerseyNumber ?? undefined,
          stats: value.stats ?? undefined,
        } as Player;
      });

      setRoster(players);
    });

    return () => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    };
  }, [user]);
  const [sortMode, setSortMode] = useState<'name' | 'ba' | 'obp' | 'slg' | 'rbi' | 'games' | 'qab_pct'>('name');
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
    const ba = s.ba ?? 0;
    const obp = s.obp ?? 0;
    const slg = s.slg ?? 0;
    const rbi = s.rbi ?? 0;
    const games = s.games ?? 0;
    const qab_pct = s.qab_pct ?? 0;

    if (mode === 'ba') return ba;
    if (mode === 'obp') return obp;
    if (mode === 'slg') return slg;
    if (mode === 'rbi') return rbi;
    if (mode === 'games') return games;
    if (mode === 'qab_pct') return qab_pct;
    return 0;
  };

  const sortedRoster = [...roster].sort((a: any, b: any) => {
    if (sortMode === 'name') return a.last_name.localeCompare(b.last_name);
    if (sortMode === 'ba') return getMetric(b, 'ba') - getMetric(a, 'ba');
    if (sortMode === 'obp') return getMetric(b, 'obp') - getMetric(a, 'obp');
    if (sortMode === 'slg') return getMetric(b, 'slg') - getMetric(a, 'slg');
    if (sortMode === 'rbi') return getMetric(b, 'rbi') - getMetric(a, 'rbi');
    if (sortMode === 'games') return getMetric(b, 'games') - getMetric(a, 'games');
    if (sortMode === 'qab_pct') return getMetric(b, 'qab_pct') - getMetric(a, 'qab_pct');
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
            onAutoGenerate={async () => {
              // lazy import algorithm to keep file clear; always brute (default)
              const alg = require('../Lineups/LineupAlgorithm') as typeof import('../Lineups/LineupAlgorithm');
              const result = alg.generateOptimalLineup(roster, { lineupSize: Math.min(9, roster.length)});
              // compute raw metrics (rcv) and persist per-player so batting order can read stored values
              try {
                const raw = alg.computeRawMetrics(roster);
                await Promise.all(roster.map(async (p) => {
                  const rcv = raw.get(p.id)?.rcv ?? 0;
                  const merged = { ...(p.stats ?? {}), rcv };
                  try {
                    await updatePlayerStats(user!.uid, String(p.id), merged);
                  } catch (e) {
                    // ignore per-player write errors
                  }
                }));
              } catch (e) {
                // ignore persistence errors
              }
              setBattingOrder(result.lineup);
            }}
            onClearOrder={() => setBattingOrder(null)}
          />
        )}

        <Divider style={{ marginVertical: 12 }} />

        <View style={styles.rosterContainer}>
          <Text variant="titleMedium" style={{ marginBottom: 6 }}>Players</Text>
          <View style={styles.sortRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
              <Button mode={sortMode === 'name' ? 'contained' : 'outlined'} onPress={() => setSortMode('name')} compact>
                Name
              </Button>
              <Button mode={sortMode === 'ba' ? 'contained' : 'outlined'} onPress={() => setSortMode('ba')} compact style={{ marginLeft: 8 }}>
                BA
              </Button>
              <Button mode={sortMode === 'obp' ? 'contained' : 'outlined'} onPress={() => setSortMode('obp')} compact style={{ marginLeft: 8 }}>
                OBP
              </Button>
              <Button mode={sortMode === 'slg' ? 'contained' : 'outlined'} onPress={() => setSortMode('slg')} compact style={{ marginLeft: 8 }}>
                SLG
              </Button>
              <Button mode={sortMode === 'rbi' ? 'contained' : 'outlined'} onPress={() => setSortMode('rbi')} compact style={{ marginLeft: 8 }}>
                RBI
              </Button>
              <Button mode={sortMode === 'games' ? 'contained' : 'outlined'} onPress={() => setSortMode('games')} compact style={{ marginLeft: 8 }}>
                Games
              </Button>
              <Button mode={sortMode === 'qab_pct' ? 'contained' : 'outlined'} onPress={() => setSortMode('qab_pct')} compact style={{ marginLeft: 8 }}>
                QAB
              </Button>
            </ScrollView>
          </View>

          <RosterScroller sortedRoster={sortedRoster} metricMode={sortMode} assignments={assignments} posById={posById} openStats={openStats} />
        </View>

        <PickerDialog visible={dialog.visible} positionId={dialog.positionId} closePicker={closePicker} roster={roster} assignments={assignments} selectNone={selectNone} selectPlayer={selectPlayer} posById={posById} />

        <StatsDialog visible={statsDialog.visible} player={statsDialog.player} closeStats={closeStats} />

      </View>
    </PaperProvider>
  );
}
