import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function TabsIndex() {
  const router = useRouter();

  useEffect(() => {
    // Ensure the tabs root redirects to the profile tab
    router.replace("/(tabs)/profile");
  }, [router]);

  return null;
  
} 
