import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublishableKey } from "@/lib/supabase/publishable-key";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    getSupabasePublishableKey(),
  );
}
