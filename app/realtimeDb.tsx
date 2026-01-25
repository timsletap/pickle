import { getDatabase, onValue, push, ref, remove, set } from "firebase/database";
import { app } from "../config/FirebaseConfig";

export function fetchPlayerInfo(
  userId: string,
  callback: (
    players: Record<
      string,
      {
        name: string;
        positions?: string[];
        jerseyNumber?: number;
        stats?: Record<string, any>;
      }
    > | null
  ) => void
) {
  const db = getDatabase(app);
  const playersRef = ref(db, `players/${userId}`);
  const unsubscribe = onValue(playersRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as Record<string, { name: string; positions?: string[]; jerseyNumber?: number }>) : null);
  });

  return () => unsubscribe();
}

export async function savePlayerInfo(
    userId: string, 
    player: { name: string; positions: string[]; jerseyNumber?: number },
    playerId?: string
): Promise<string> {
  const db = getDatabase(app);
  const playersRef = ref(db, `players/${userId}`);
  
  if (playerId) {
    const playerRef = ref(db, `players/${userId}/${playerId}`);
    await set(playerRef, {
      name: player.name,
      positions: player.positions || [],
      jerseyNumber: player.jerseyNumber ?? null,
      updatedAt: Date.now(),
    });
    
    return playerId;
  } else {
    const newRef = push(playersRef);
    await set(newRef, {
        name: player.name,
        positions: player.positions || [],
        jerseyNumber: player.jerseyNumber ?? null,
        createdAt: Date.now(),
    });
    return newRef.key as string;
}
}

export async function savePlayerStats(
    userId: string, 
    stats: Record<string, any>,
    playerId?: string
): Promise<void> {
  const db = getDatabase(app);
  const playersRef = ref(db, `players/${userId}`);

  if (playerId) {
    const playerRef = ref(db, `players/${userId}/${playerId}/stats`);
    await set(playerRef, stats);
    return;
  }
  else {
    const newRef = push(playersRef);
    await set(newRef, { stats });
    return;
  }
}

export async function savePlayerStatsDefensive(
    userId: string, 
    stats: Record<string, any>,
    playerId?: string
): Promise<void> {
  const db = getDatabase(app);
  const playersRef = ref(db, `players/${userId}`);

  if (playerId) {
    const playerRef = ref(db, `players/${userId}/${playerId}/statsDefensive`);
    await set(playerRef, stats);
    return;
  }
  else {
    const newRef = push(playersRef);
    await set(newRef, { statsDefensive: stats });
    return;
  }
}

export async function deletePlayer(userId: string, playerId: string): Promise<void> {
  const db = getDatabase(app);
  await remove(ref(db, `players/${userId}/${playerId}`));
}