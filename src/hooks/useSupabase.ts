import { createClerkSupabaseClient } from "@/src/lib/supabase";
import { useAuth } from "@clerk/expo";
import { useMemo } from "react";

export default function useSupabase() {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    return createClerkSupabaseClient(() => getToken());
  }, [getToken]);

  return client;
}
