import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import useSupabase from "./useSupabase";

export const useSaveProperty = (propertyId: string, onUnsave?: () => void) => {
  const { userId } = useAuth();
  const supabase = useSupabase();

  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const checkIfSaved = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("saved_properties")
      .select("id")
      .eq("user_clerk_id", userId)
      .eq("property_id", propertyId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.log("Error checking saved property:", error);
      return;
    }

    setIsSaved(!!data);
  };

  useEffect(() => {
    checkIfSaved();
  }, [userId, propertyId]);

  const toggleSave = async (propertyId: string) => {
    if (!userId) return;
    setIsLoadingSave(true);

    // Check if already saved
    if (isSaved) {
      // If exists, delete it
      const { error: deleteError } = await supabase
        .from("saved_properties")
        .delete()
        .eq("user_clerk_id", userId)
        .eq("property_id", propertyId);

      if (deleteError) {
        console.log("Error unsaving property:", deleteError);
      }
      setIsSaved(false);
      onUnsave?.();
    } else {
      // If not exists, insert it
      const { error: insertError } = await supabase
        .from("saved_properties")
        .insert({
          user_clerk_id: userId,
          property_id: propertyId,
        });

      if (insertError) {
        console.log("Error saving property:", insertError);
      }
      setIsSaved(true);
    }

    setIsLoadingSave(false);
  };

  return { isLoadingSave, isSaved, toggleSave };
};
