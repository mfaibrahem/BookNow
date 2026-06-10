import useUserSync from "@/src/hooks/useUserSync";
import { useAuth } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";

export default function RootLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  // Sync clerk user -> supabase user
  useUserSync();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={"/sign-in"} />;
  }

  return <Slot />;
}
