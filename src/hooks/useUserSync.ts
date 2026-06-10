import useUserStore from "@/src/store/userStore";
import { useUser } from "@clerk/expo";
import { useEffect } from "react";
import useSupabase from "./useSupabase";

export default function useUserSync() {
  const { user } = useUser();
  const setIsAdmin = useUserStore((state) => state.setAdmin);

  const authSupabase = useSupabase();

  useEffect(() => {
    if (!user) {
      return;
    }

    syncUser();
  }, [user, setIsAdmin]);

  const syncUser = async () => {
    const { data, error } = await authSupabase
      .from("users")
      .select("clerk_id, is_admin")
      .eq("clerk_id", user?.id)
      .single();
    // if (error) {
    //   console.error("Error fetching user data:", error);
    //   return;
    // }
    if (data) {
      setIsAdmin(data?.is_admin || false);
      return;
    }

    const { data: newUser, error: insertError } = await authSupabase
      .from("users")
      .insert({
        clerk_id: user?.id,
        email: user?.emailAddresses[0]?.emailAddress || "",
        first_name: user?.firstName || "",
        last_name: user?.lastName || "",
        avatar_url: user?.imageUrl || "",
      })
      .select("is_admin")
      .single();

    if (insertError) {
      console.error("Error inserting new user:", insertError);
      return;
    }

    if (newUser) {
      setIsAdmin(newUser.is_admin || false);
    }
  };
}
