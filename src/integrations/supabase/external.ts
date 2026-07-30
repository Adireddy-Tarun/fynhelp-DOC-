import { createClient } from "@supabase/supabase-js";
import { supabase } from "./client";

const EXTERNAL_SUPABASE_URL = "https://wiknwxniwqvsxgyzqqxu.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpa253eG5pd3F2c3hneXpxcXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzc1MTksImV4cCI6MjA5MTgxMzUxOX0.MVIp_hMUZsiMQ-LFulVdYaFkGonNk5WwdcHYWsx__qY";

export const supabaseExternal = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: async (url, options = {}) => {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        const headers = new Headers((options as RequestInit).headers);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
          headers.set("apikey", EXTERNAL_SUPABASE_ANON_KEY);
        }
        return fetch(url, { ...(options as RequestInit), headers });
      },
    },
  }
);
