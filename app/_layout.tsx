import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../FirebaseConfig";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuth(!!user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // When we know the auth state, redirect unauthenticated users
    if (isAuth === null) return; // still loading
    if (!isAuth) {
      router.replace("/auth");
    }
  }, [isAuth, router]);

  // Avoid rendering protected UI while we are checking auth state
  if (isAuth === null) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <RouteGuard>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </RouteGuard>
  );
}
