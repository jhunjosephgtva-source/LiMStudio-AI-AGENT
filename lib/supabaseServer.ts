import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client. Uses the publishable/anon key — all write
// operations are protected by the app's own admin-password check in the
// API routes (see lib/adminAuth.ts), not by Supabase RLS alone.
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
