import { router } from 'expo-router';
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Dialog, IconButton, Portal, Text, TextInput, useTheme } from "react-native-paper";
import { updatePlayerStats } from "../config/FirebaseConfig";
import { useAuth } from "./auth-context";
import { fetchPlayerInfo } from "./realtimeDb";
import type { Player } from './types';

import FilterSheet from './FilterSheet';
import StatsList from './StatsList';

export default function StatsScreen() {
  const { user } = useAuth();
  const theme = useTheme();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsub = fetchPlayerInfo(user.uid, (data) => {
      if (!data) {
        setPlayers([]);
        setLoading(false);
        return;
      }

      const arr = Object.entries(data).map(([id, val]) => {
        const v = val as any;
        return { id, name: v.name, positions: v.positions || [], jerseyNumber: v.jerseyNumber ?? undefined, stats: v.stats || {} } as Player;
      });
      arr.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      setPlayers(arr);
      setLoading(false);
    });

    return () => unsub && unsub();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please sign in to manage players.</Text>
      </View>
    );
  }

  // Stats editor state
  const [statsDialogVisible, setStatsDialogVisible] = useState(false);
  const [editingStatsId, setEditingStatsId] = useState<string | null>(null);
  const [editingPlayerName, setEditingPlayerName] = useState<string | null>(null);
  const [baText, setBaText] = useState("");
  const [obpText, setObpText] = useState("");
  const [slgText, setSlgText] = useState("");
  const [rbiText, setRbiText] = useState("");
  const [gamesText, setGamesText] = useState("");
  const [qabText, setQabText] = useState("");

  const openStatsEditor = (p: Player) => {
    setEditingStatsId(p.id);
    setEditingPlayerName(p.name ?? null);
    const s = p.stats ?? {};
    setBaText(s.ba != null ? String(s.ba) : "");
    setObpText(s.obp != null ? String(s.obp) : "");
    setSlgText(s.slg != null ? String(s.slg) : "");
    setRbiText(s.rbi != null ? String(s.rbi) : "");
    setGamesText(s.games != null ? String(s.games) : "");
    setQabText(s.qab != null ? String(s.qab) : "");
    setStatsDialogVisible(true);
    
  };

  // Selected stat (single choice). null = none (default alphabetical).
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const toggleFilter = (key: string) => {
    if (selectedStat === key) setSelectedStat(null);
    else setSelectedStat(key);
  };

  const clearFilters = () => setSelectedStat(null);

  const statKeyMap: Record<string, string> = { ba: 'ba', obp: 'obp', slg: 'slg', rbi: 'rbi', games: 'games', qab: 'qab', rcv: 'rcv' };

  const computeRcv = (s: any) => {
    const ba = Number(s.ba ?? 0);
    const obp = Number(s.obp ?? 0);
    const slg = Number(s.slg ?? 0);
    const rbi = Number(s.rbi ?? 0);
    const games = Number(s.games ?? 0);
    const qab = Number(s.qab ?? 0);
    return 0.35 * obp + 0.25 * slg + 0.15 * ba + (games > 0 ? rbi / games : 0) + 0.10 * qab;
  };

  // Compute displayed players based on the single selected stat.
  const filteredPlayers = (() => {
    if (!selectedStat) {
      // default: alphabetical
      return players.slice().sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    }

    if (selectedStat === 'none') {
      // show only players with no stats set (exclude computed `rcv`)
      const statKeys = Object.values(statKeyMap).filter((k) => k !== 'rcv');
      return players.filter((p) => !statKeys.some((sk) => p.stats && p.stats[sk] != null)).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    }

    if (selectedStat === 'rcv') {
      return players.slice().sort((a, b) => {
        const va = a.stats ? computeRcv(a.stats) : 0;
        const vb = b.stats ? computeRcv(b.stats) : 0;
        if (vb !== va) return vb - va;
        return (a.name ?? '').localeCompare(b.name ?? '');
      });
    }

    const sk = statKeyMap[selectedStat];
    // sort by selected stat (missing -> 0), descending
    return players.slice().sort((a, b) => {
      const va = a.stats && a.stats[sk] != null ? Number(a.stats[sk]) : 0;
      const vb = b.stats && b.stats[sk] != null ? Number(b.stats[sk]) : 0;
      if (vb !== va) return vb - va;
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  })();

  const closeStatsDialog = () => setStatsDialogVisible(false);

  const handleSaveStats = async () => {
    if (!user || !editingStatsId) return;
    const stats: Record<string, any> = {};
    const parse = (v: string) => (v === "" ? null : Number(v));
    if (baText !== "") stats.ba = parse(baText);
    if (obpText !== "") stats.obp = parse(obpText);
    if (slgText !== "") stats.slg = parse(slgText);
    if (rbiText !== "") stats.rbi = parse(rbiText);
    if (gamesText !== "") stats.games = parse(gamesText);
    if (qabText !== "") stats.qab = parse(qabText);

    try {
      await updatePlayerStats(user.uid, editingStatsId, stats);
      closeStatsDialog();
    } catch (err) {
      console.error("Failed to save stats", err);
      closeStatsDialog();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <IconButton
        icon="arrow-left"
        size={30}
        onPress={() => router.push('/profile')}
        containerColor="transparent"
        iconColor="#fff"
        style={styles.backButton}
      />
      {loading ? (
        <ActivityIndicator animating size="large" />
      ) : players.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.text}>No players yet.</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          <StatsList players={filteredPlayers} selectedStat={selectedStat} openStatsEditor={openStatsEditor} statKeyMap={statKeyMap} />
        </ScrollView>
      )}

      <Portal>
        <Dialog visible={statsDialogVisible} onDismiss={closeStatsDialog}>
          <Dialog.Title>{editingPlayerName ? `Edit Stats — ${editingPlayerName}` : 'Edit Stats'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Batting Average (BA)" value={baText} onChangeText={setBaText} keyboardType="numeric" returnKeyType="done" mode="outlined" />
            <TextInput label="On-Base % (OBP)" value={obpText} onChangeText={setObpText} keyboardType="numeric" returnKeyType="done" mode="outlined" />
            <TextInput label="Slugging % (SLG)" value={slgText} onChangeText={setSlgText} keyboardType="numeric" returnKeyType="done" mode="outlined" />
            <TextInput label="RBI" value={rbiText} onChangeText={setRbiText} keyboardType="numeric" returnKeyType="done" mode="outlined" />
            <TextInput label="Games" value={gamesText} onChangeText={setGamesText} keyboardType="numeric" returnKeyType="done" mode="outlined" />
            <TextInput label="Quality At-Bat % (QAB%)" value={qabText} onChangeText={setQabText} keyboardType="numeric" returnKeyType="done" mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeStatsDialog}>Cancel</Button>
            <Button onPress={handleSaveStats}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FilterSheet selectedStat={selectedStat} onSelectStat={toggleFilter} clear={clearFilters} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 96,
  },
  
  empty: {
    marginTop: 24,
    alignItems: "center",
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
  },
  toggleButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    zIndex: 40,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 320,
    backgroundColor: '#0b0b0b',
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 10,
  },
  arrow: { fontSize: 22, fontWeight: '700' },
  sheetHandleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 70,
    zIndex: 60,
  },
  
});

