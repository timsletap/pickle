import { useEffect, useState } from "react";
import { Dimensions, Keyboard, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Chip, Dialog, FAB, List, Portal, Text, TextInput, useTheme } from "react-native-paper";
import Carousel from "react-native-reanimated-carousel";
import { useAuth } from "./auth-context";
import { deletePlayer, fetchPlayerInfo, savePlayerInfo } from "./realtimeDb";

export default function TeamsScreen() {
  const { user } = useAuth();
  const theme = useTheme();

  const [players, setPlayers] = useState<Array<{ id: string; name: string; positions?: string[]; jerseyNumber?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [positions, setPositions] = useState<string[]>([]);
  const [jerseyText, setJerseyText] = useState("");

  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  // Larger card sizing for clearer player display. Subtract extra margin to avoid edge cutoff.
  const CARD_WIDTH = Math.min(420, SCREEN_WIDTH - 48);
  const CARD_HEIGHT = 380;

  const KNOWN_POSITIONS = [
    "P",
    "C",
    "1B",
    "2B",
    "3B",
    "SS",
    "LF",
    "CF",
    "RF",
    "DH",
    "UT",
  ];

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetchPlayerInfo(user.uid, (data) => {
      if (!data) {
        setPlayers([]);
        setLoading(false);
        return;
      }

      const arr = Object.entries(data).map(([id, val]) => ({ id, name: val.name, positions: val.positions || [], jerseyNumber: val.jerseyNumber ?? undefined }));
      arr.sort((a, b) => a.name.localeCompare(b.name));
      setPlayers(arr);
      setLoading(false);
    });

    return () => {};
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please sign in to manage players.</Text>
      </View>
    );
  }

  const openNew = () => {
    setEditingId(null);
    setName("");
    setPositions([]);
    setJerseyText("");
    setDialogVisible(true);
  };

  const openEdit = (p: { id: string; name: string; positions?: string[]; jerseyNumber?: number }) => {
    setEditingId(p.id);
    setName(p.name);
    setPositions((p.positions || []).slice());
    setJerseyText(p.jerseyNumber != null ? String(p.jerseyNumber) : "");
    setDialogVisible(true);
  };

  const closeDialog = () => setDialogVisible(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const positionsArr = positions.slice();
    const jersey = jerseyText.trim() ? parseInt(jerseyText.trim(), 10) : undefined;
    Keyboard.dismiss();

    try {
      await savePlayerInfo(user.uid, { name: trimmed, positions: positionsArr, jerseyNumber: jersey }, editingId ?? undefined);
      closeDialog();
    } catch (err) {
      console.error("Failed to save player", err);
      closeDialog();
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    try {
      await deletePlayer(user.uid, editingId);
      closeDialog();
    } catch (err) {
      console.error("Failed to delete player", err);
      closeDialog();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {loading ? (
        <ActivityIndicator animating size="large" />
      ) : players.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.text}>No players yet.</Text>
        </View>
      ) : (
        <View style={{ alignItems: "center" }}>
          <Carousel
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            data={players}
            loop={true}
            pagingEnabled={true}
            snapEnabled={true}
            autoPlay={false}
            mode="parallax"
            modeConfig={{ parallaxScrollingScale: 0.9, parallaxScrollingOffset: 50 }}
            renderItem={({ item }) => (
              <View style={[styles.cardWrap, { width: CARD_WIDTH, height: CARD_HEIGHT }]}> 
                <List.Item
                  title={item.name}
                  description={(item.positions || []).join(", ") + (item.jerseyNumber != null ? `  #${item.jerseyNumber}` : "")}
                  //onPress={() => openEdit(item)}
                  style={[
                    styles.card,
                    { width: CARD_WIDTH - 32, height: CARD_HEIGHT - 32, borderWidth: 2, borderColor: 'rgba(0,255,65,0.12)', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.02)' },
                  ]}
                  titleStyle={{ fontSize: 20, fontWeight: "600", color: '#fff' }}
                  descriptionStyle={{ fontSize: 16, color: '#cfcfcf' }}
                />
              </View>
            )}
          />

          <Text style={styles.hintText}>Swipe to see all players</Text>
        </View>
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>{editingId ? "Edit Player" : "New Player"}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Player name" value={name} onChangeText={setName} mode="outlined" textColor="#000" outlineColor="rgba(0,0,0,0.12)" activeOutlineColor="#000" />

            <View style={styles.chipsRow}>
              {KNOWN_POSITIONS.map((pos) => {
                const active = positions.includes(pos);
                return (
                  <Chip
                    key={pos}
                    selected={active}
                    onPress={() => {
                      if (active) setPositions((prev) => prev.filter((p) => p !== pos));
                      else setPositions((prev) => [...prev, pos]);
                    }}
                    style={[styles.chip, { backgroundColor: active ? '#000' : 'transparent' }]}
                  >
                    <Text style={{ color: active ? '#fff' : '#000' }}>{pos}</Text>
                  </Chip>
                );
              })}
            </View>

            <TextInput
              label="Jersey number"
              value={jerseyText}
              onChangeText={setJerseyText}
              keyboardType="numeric"
              returnKeyType="done"
              mode="outlined"
              textColor="#000"
              outlineColor="rgba(0,0,0,0.12)"
              activeOutlineColor="#000"
             //onSubmitEditing={handleSave}
            />
          </Dialog.Content>
          <Dialog.Actions>
            {editingId ? (
              <Button textColor={theme.colors.error} onPress={handleDelete}>Delete</Button>
            ) : (
              <Button textColor={theme.colors.error} onPress={closeDialog}>Cancel</Button>
            )}
            <Button textColor={editingId ? undefined : '#15af3bff'} onPress={handleSave}>{editingId ? "Save" : "Create"}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB style={[styles.fab, { backgroundColor: '#00ff41' }]} icon="plus" label="New Player" onPress={openNew} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    marginBottom: 8,
  },
  empty: {
    marginTop: 24,
    alignItems: "center",
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  hintText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#cfcfcf',
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    color: "#00ff41",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  cardWrap: {
  width: "100%",
  height: "100%",
  justifyContent: "center",
  paddingHorizontal: 8,
  alignItems: "center",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2, // android shadow
  },
  dialog: {
    backgroundColor: '#ffffffb9',
  },
  dialogTitle: {
    color: '#000',
  },
});
