// import necessary Firebase modules
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { get, getDatabase, ref, remove, set } from "firebase/database";

// configuration for Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA4qT1x2OMofiDoQwMhmWvf4ddrbiXXVDo",
  authDomain: "pickle-cab2c.firebaseapp.com",
  databaseURL: "https://pickle-cab2c-default-rtdb.firebaseio.com/",
  projectId: "pickle-cab2c",
  storageBucket: "pickle-cab2c.firebasestorage.app",
  messagingSenderId: "1082279199176",
  appId: "1:1082279199176:web:dd765bd7307016e19700fd",
  measurementId: "G-D02L7K2K57"
};

// initialize and export Firebase app for app-wide use
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export { app };

// initialize Analytics only on client-side
let analytics: ReturnType<typeof import("firebase/analytics").getAnalytics> | null = null;
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

// initialize and export Firebase Auth instance for app-wide use
const auth = getAuth(app);
export { auth };

export async function writeUserData(userId: string, name: string, email: string) {
  const db = getDatabase(app);
  const reference = ref(db, 'users/' + userId);

  await set(reference, {
    username: name,
    email: email
  });

  console.log('Realtime DB write succeeded for user', userId);
}

export async function readUserData(userId: string): Promise<{ username?: string; email?: string } | null> {
  const db = getDatabase(app);
  const snapshot = await get(ref(db, 'users/' + userId));
  if (snapshot.exists()) {
    return snapshot.val() as { username?: string; email?: string };
  }
  return null;
}

export async function deleteUserData(userId: string): Promise<void> {
  const db = getDatabase(app);
  await remove(ref(db, 'users/' + userId));
}

// Stats helpers
export async function updatePlayerStats(userId: string, playerId: string, stats: Record<string, any>): Promise<void> {
  const db = getDatabase(app);
  // write the stats sub-node for the player
  await set(ref(db, `players/${userId}/${playerId}/stats`), stats);
}

export async function deletePlayer(userId: string, playerId: string): Promise<void> {
  const db = getDatabase(app);
  await remove(ref(db, `players/${userId}/${playerId}`));
}