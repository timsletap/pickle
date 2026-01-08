import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, List, Provider as PaperProvider, Portal, Text } from "react-native-paper";

type Player = {
  id: number;
  first_name: string;
  last_name: string;
  jersey?: number;
  // simple per-player stats used for sorting and display
  stats?: {
    avg: number; // batting average
    hits: number;
    rbi?: number;
    games?: number;
    obp?: number;
  };
};

type Position = {
  id: string;
  label: string;
  name: string;
  top: string;
  left: string;
};

const POSITIONS: Position[] = [
  { id: "P", label: "P", name: "Pitcher", top: "55%", left: "37.5%" },
  { id: "C", label: "C", name: "Catcher", top: "77.5%", left: "37.5%" },
  { id: "1B", label: "1B", name: "First Base", top: "52.5%", left: "65%" },
  { id: "2B", label: "2B", name: "Second Base", top: "32.5%", left: "51.25%" },
  { id: "3B", label: "3B", name: "Third Base", top: "52.5%", left: "10%" },
  { id: "SS", label: "SS", name: "Shortstop", top: "32.5%", left: "23.75%" },
  { id: "LF", label: "LF", name: "Left Field", top: "7.5%", left: "0%" },
  { id: "CF", label: "CF", name: "Center Field", top: "2.5%", left: "37.5%" },
  { id: "RF", label: "RF", name: "Right Field", top: "7.5%", left: "75%" },
];

const SAMPLE_ROSTER: Player[] = [
  { id: 1, first_name: "Ava", last_name: "Smith", jersey: 12, stats: { avg: 0.375, hits: 27, rbi: 15, games: 12, obp: 0.420 } },
  { id: 2, first_name: "Bella", last_name: "Jones", jersey: 4, stats: { avg: 0.312, hits: 20, rbi: 10, games: 12, obp: 0.360 } },
  { id: 3, first_name: "Carla", last_name: "Brown", jersey: 9, stats: { avg: 0.289, hits: 18, rbi: 8, games: 12, obp: 0.335 } },
  { id: 4, first_name: "Diana", last_name: "Garcia", jersey: 22, stats: { avg: 0.400, hits: 28, rbi: 20, games: 14, obp: 0.450 } },
  { id: 5, first_name: "Ella", last_name: "Davis", jersey: 7, stats: { avg: 0.250, hits: 15, rbi: 6, games: 12, obp: 0.300 } },
  { id: 6, first_name: "Faith", last_name: "Miller", jersey: 1, stats: { avg: 0.305, hits: 19, rbi: 9, games: 12, obp: 0.340 } },
  { id: 7, first_name: "Gwen", last_name: "Wilson", jersey: 15, stats: { avg: 0.275, hits: 16, rbi: 7, games: 12, obp: 0.310 } },
  { id: 8, first_name: "Hannah", last_name: "Moore", jersey: 6, stats: { avg: 0.330, hits: 21, rbi: 11, games: 12, obp: 0.370 } },
  { id: 9, first_name: "Ivy", last_name: "Taylor", jersey: 18, stats: { avg: 0.260, hits: 14, rbi: 5, games: 12, obp: 0.295 } },
];

export default function Lineups() {
  const [roster] = useState<Player[]>(SAMPLE_ROSTER);
  const [sortMode, setSortMode] = useState<'default' | 'avg' | 'hits'>('default');
  const [statsDialog, setStatsDialog] = useState<{ visible: boolean; player: Player | null }>({ visible: false, player: null });

  const initialAssignments: Record<string, Player | null> = POSITIONS.reduce(
    (acc, p) => ({ ...acc, [p.id]: null }),
    {}
  );

  const [assignments, setAssignments] = useState<Record<string, Player | null>>(initialAssignments);
  const [dialog, setDialog] = useState<{ visible: boolean; positionId: string | null }>({
    visible: false,
    positionId: null,
  });

  const openPicker = (positionId: string) => {
    setDialog({ visible: true, positionId });
  };

  const closePicker = () => setDialog({ visible: false, positionId: null });

  const selectPlayer = (player: Player) => {
    if (!dialog.positionId) return;
    setAssignments((prev) => ({ ...prev, [dialog.positionId as string]: player }));
    closePicker();
  };

  const selectNone = () => {
    if (!dialog.positionId) return;
    setAssignments((prev) => ({ ...prev, [dialog.positionId as string]: null }));
    closePicker();
  };

  const posById = (id: string) => POSITIONS.find((p) => p.id === id) as Position;

  const openStats = (player: Player) => setStatsDialog({ visible: true, player });
  const closeStats = () => setStatsDialog({ visible: false, player: null });

  const sortedRoster = [...roster].sort((a, b) => {
    if (sortMode === 'avg') return (b.stats?.avg ?? 0) - (a.stats?.avg ?? 0);
    if (sortMode === 'hits') return (b.stats?.hits ?? 0) - (a.stats?.hits ?? 0);
    return a.last_name.localeCompare(b.last_name);
  });

  return (
    <PaperProvider>
      <View style={styles.page}>
        <Text variant="headlineMedium" style={styles.title}>
          Create Lineup
        </Text>

      <Text style={styles.instructions}>Tap a position on the field to assign a player.</Text>

      <View style={styles.field}>
        {POSITIONS.map((pos) => {
          const assigned = assignments[pos.id];
          // cast the inline positioning object to any to satisfy TypeScript's ViewStyle/DimensionValue checks
          return (
            <View key={pos.id} style={{ position: "absolute", top: pos.top, left: pos.left, alignItems: "center" } as any}>
              <Pressable
                onPress={() => openPicker(pos.id)}
                style={({ pressed }) => [styles.positionCircle, pressed ? styles.pressed : null]}
              >
                <Text style={styles.circleText}>{assigned ? `${assigned.jersey ?? ""}` : pos.label}</Text>
              </Pressable>

              <Text style={styles.posLabel}>{assigned ? `${assigned.first_name} ${assigned.last_name}` : pos.name}</Text>


            </View>
          );
        })}
      </View>

      <View style={styles.rosterContainer}>
        <Text variant="titleMedium" style={{ marginBottom: 6 }}>Players</Text>

        <View style={styles.sortRow}>
          <Button mode={sortMode === 'default' ? 'contained' : 'outlined'} onPress={() => setSortMode('default')} compact>
            Name
          </Button>
          <Button mode={sortMode === 'avg' ? 'contained' : 'outlined'} onPress={() => setSortMode('avg')} compact style={{ marginLeft: 8 }}>
            AVG
          </Button>
          <Button mode={sortMode === 'hits' ? 'contained' : 'outlined'} onPress={() => setSortMode('hits')} compact style={{ marginLeft: 8 }}>
            Hits
          </Button>
        </View>

        <ScrollView horizontal contentContainerStyle={styles.rosterScroll} showsHorizontalScrollIndicator={false}>
          {sortedRoster.map((p) => {
            const assignedEntry = Object.entries(assignments).find(([posId, pl]) => pl?.id === p.id);
            const assignedPos = assignedEntry ? assignedEntry[0] : null;
            return (
              <View key={p.id} style={styles.playerCard}>
                <Pressable onPress={() => openStats(p)} style={({ pressed }) => [styles.playerIcon, pressed ? styles.pressed : null]}>
                  <Text style={styles.playerNumber}>{p.jersey ?? ''}</Text>
                </Pressable>
              <Text style={styles.playerName} numberOfLines={1}>{p.last_name}</Text>
                {assignedPos ? <Text style={styles.assignedText}>{posById(assignedPos).label}</Text> : null}
              </View>
            );
          })}
        </ScrollView>

      </View>

      <Portal>
        <Dialog visible={dialog.visible} onDismiss={closePicker}>
          <Dialog.Title>
            Select player for {dialog.positionId ? posById(dialog.positionId).name : ""}
          </Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogList}>
              <List.Item
                title="No selection (leave empty)"
                description="Unassign this position"
                onPress={selectNone}
                left={(props) => <List.Icon {...props} icon="close-circle-outline" />}
              />

              {roster.map((player) => {
                const assignedEntry = Object.entries(assignments).find(([posId, p]) => p?.id === player.id);
                const assignedPosId = assignedEntry ? assignedEntry[0] : null;
                const isAssignedElsewhere = !!assignedPosId && assignedPosId !== dialog.positionId;
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

        <Dialog visible={statsDialog.visible} onDismiss={closeStats}>
          <Dialog.Title>{statsDialog.player ? `${statsDialog.player.first_name} ${statsDialog.player.last_name}` : ''}</Dialog.Title>
          <Dialog.Content>
            <List.Item title={`Jersey: ${statsDialog.player?.jersey ?? '-'}`} />
            <List.Item title={`AVG: ${statsDialog.player?.stats ? statsDialog.player.stats.avg.toFixed(3) : '-'}`} />
            <List.Item title={`Hits: ${statsDialog.player?.stats?.hits ?? '-'}`} />
            <List.Item title={`RBI: ${statsDialog.player?.stats?.rbi ?? '-'}`} />
            <List.Item title={`Games: ${statsDialog.player?.stats?.games ?? '-'}`} />
            <List.Item title={`OBP: ${statsDialog.player?.stats?.obp ?? '-'}`} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeStats}>Close</Button>
          </Dialog.Actions>
        </Dialog>

      </Portal>
    </View>
  </PaperProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  instructions: {
    marginBottom: 12,
  },
  field: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#cfeeb7",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#8fc97a",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  positionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  pressed: {
    opacity: 0.7,
  },
  circleText: {
    fontWeight: "bold",
  },
  posLabel: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
    width: 90,
  },
  dialogList: {
    maxHeight: 300,
  },
  rosterContainer: {
    marginTop: 16,
  },
  sortRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  rosterScroll: {
    paddingVertical: 8,
  },
  playerCard: {
    alignItems: 'center',
    width: 72,
    marginRight: 12,
  },
  playerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  playerNumber: {
    fontWeight: 'bold',
  },
  playerName: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  assignedText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  }
});