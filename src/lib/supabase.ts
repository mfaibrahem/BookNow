import { createClient } from "@supabase/supabase-js";

const subabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

if (!subabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL and Key must be provided in environment variables",
  );
}

// For public calls, we can use a single shared client throughout the app
export const supabase = createClient(subabaseUrl, supabaseKey);

// For authenticated calls, we will create a separate client that can be used in our API routes
export function createClerkSupabaseClient(
  getToken: () => Promise<string | null>,
) {
  return createClient(subabaseUrl, supabaseKey, {
    async accessToken() {
      return getToken();
    },
  });
}
