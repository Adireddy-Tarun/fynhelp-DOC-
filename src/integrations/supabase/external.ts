// External Supabase client, points at the user's main Supabase project
// (project ref: wiknwxniwqvsxgyzqqxu), separate from the Lovable Cloud
// backend used by `./client`.
//
// Use this client for features that should live in the external project
// (currently: the public waitlist signup flow).
//
// NOTE: This client is intentionally untyped (no generated Database types)
// because types.ts is auto-generated against Lovable Cloud only.
import { createClient } from "@supabase/supabase-js";

const EXTERNAL_SUPABASE_URL = "https://wiknwxniwqvsxgyzqqxu.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpa253eG5pd3F2c3hneXpxcXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzc1MTksImV4cCI6MjA5MTgxMzUxOX0.MVIp_hMUZsiMQ-LFulVdYaFkGonNk5WwdcHYWsx__qY";

export const supabaseExternal = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY,
  {
    auth: {
      // Use a distinct storage key so this client's session never collides
      // with the Lovable Cloud client's session.
      storageKey: "sb-external-auth",
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
