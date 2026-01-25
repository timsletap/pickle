import { router } from 'expo-router';
import { useEffect, useState } from "react";
import { Dimensions, Keyboard, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Chip, Dialog, FAB, IconButton, List, Portal, Text, TextInput, useTheme } from "react-native-paper";
import Carousel from "react-native-reanimated-carousel";
import { useAuth } from "./auth-context";
import { deletePlayer, fetchPlayerInfo, savePlayerInfo } from "./realtimeDb";

export default function TeamsScreen() {
  const { user } = useAuth();
  const theme = useTheme();

  const [players, setPlayers] = useState<Array<{ id: string; name: string; positions?: string[]; jerseyNumber?: number; stats?: Record<string, any> }>>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [positions, setPositions] = useState<string[]>([]);
  const [jerseyText, setJerseyText] = useState("");

  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  // Larger card sizing for clearer player display. Subtract extra margin to avoid edge cutoff.
  const CARD_WIDTH = Math.min(400, SCREEN_WIDTH - 32);
  const CARD_HEIGHT = 450;

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

      const arr = Object.entries(data).map(([id, val]) => ({ 
        id, 
        name: val.name, 
        positions: val.positions || [], 
        jerseyNumber: val.jerseyNumber ?? undefined,
        stats: val.stats || {},
      }));
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

  const openEdit = (p: { id: string; name: string; positions?: string[]; jerseyNumber?: number; stats?: Record<string, any> }) => {
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
            renderItem={({ item }) => {

              const stats = item.stats || {};
              const BA = stats.ba != null ? stats.ba.toFixed(2) : "N/A";
              const OBP = stats.obp != null ? stats.obp.toFixed(2) : "N/A";
              const SLG = stats.slg != null ? stats.slg.toFixed(2) : "N/A";
              const RBI = stats.rbi != null ? stats.rbi : "N/A";
              const GAMES = stats.games != null ? stats.games : "N/A";
              const QAB = stats.qab != null ? stats.qab.toFixed(2) : "N/A";

              const descBase = (item.positions || []).join(", ") + (item.jerseyNumber != null ? `  #${item.jerseyNumber}` : "");
              
              return (
                <View style={[styles.cardWrap, { width: CARD_WIDTH, height: CARD_HEIGHT }]}> 
                  <List.Item
                    title={item.name}
                    description={
                      <View style={{ flexDirection: "column", paddingTop: 8 }}>
                        <Text style={styles.cardText}>
                          {`Positions: ${item.positions?.join(", ") || "N/A"}`}
                        </Text>
                        <Text style={[styles.cardText, { paddingBottom: 24 }]}>
                          {`Jersey Number: ${item.jerseyNumber != null ? item.jerseyNumber : "N/A"}`}
                        </Text>

                        <Text style={styles.cardText}>
                          {`Games: ${GAMES}`}
                        </Text>
                        <Text style={styles.cardText}>
                          {`BA: ${BA}`}
                        </Text>
                        <Text style={styles.cardText}>
                          {`OBP: ${OBP}`}
                        </Text>
                        <Text style={styles.cardText}>
                          {`SLG: ${SLG}`}
                        </Text>
                        <Text style={styles.cardText}>
                          {`RBI: ${RBI}`}
                        </Text>
                        <Text style={styles.cardText}>
                          {`QAB%: ${QAB}`}
                        </Text>
                        {/*}
                        <Text style={styles.cardHint}>
                          Tap card to edit player
                        </Text>
                        */}
                      </View>
                    }

                    //onPress={() => openEdit(item)}
                    style={[
                      styles.card,
                      { width: CARD_WIDTH - 32, 
                        height: CARD_HEIGHT - 32, 
                        borderRadius: 20, 
                        backgroundColor: 'rgba(0,0,0,0.45)', 
                        borderWidth: 1.5, 
                        borderColor: '#00a878',
                        shadowColor: '#00a878',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 10,
                      }
                    ]}
                    titleStyle={{ fontSize: 36, fontWeight: "600", color: '#fff' , marginBottom: 24 }}
                    descriptionStyle={{ fontSize: 16, color: '#cfeecf' }}
                  />
                  <IconButton
                    icon="pencil"
                    size={24}
                    iconColor="#00a878"
                    containerColor="transparent"
                    onPress={() => openEdit(item)}
                    style={styles.editIcon}
                  />
                </View>
              );
            }}
          />

          <Text style={[styles.cardHint, { marginTop: 8, textAlign: "center" }]}>Swipe to see all players</Text>
        </View>
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>{editingId ? "Edit Player" : "New Player"}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Player name" value={name} onChangeText={setName} />

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
                    style={styles.chip}
                  >
                    {pos}
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
             //onSubmitEditing={handleSave}
            />
          </Dialog.Content>
          <Dialog.Actions>
            {editingId ? <Button textColor={theme.colors.error} onPress={handleDelete}>Delete</Button> : <Button onPress={closeDialog}>Cancel</Button>}
            <Button onPress={handleSave}>{editingId ? "Save" : "Create"}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

  <FAB style={[styles.fab, { backgroundColor: '#00a878' }]} icon="plus" label="New Player" onPress={openNew} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 160,
    //justifyContent: "center",
  },
  headerRow: {
    marginBottom: 8,
  },
  empty: {
    marginTop: 24,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
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
  editIcon: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardText: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 4,
  },
  cardHint: {
    color: '#cfeecf',
    marginTop: 8,
    fontSize: 13,
  },
  text: {
    color: '#fff',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 70,
    zIndex: 60,
  },
});
