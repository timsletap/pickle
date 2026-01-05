import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuth = false;

  useEffect(() => {
    // delay was set to get over the error, error: 
    // Attempted to navigate before mounting the Root Layout component
    const timerId = setTimeout(() => {
      if (!isAuth) {
        router.replace("/auth");
      }
    }, 100); // 100 milliseconds = 0.1 second delay

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(timerId);
    };
  }, []);

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
