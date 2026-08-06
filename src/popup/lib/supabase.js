import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cloud sync is entirely optional — if the extension was built without
// Supabase credentials (.env not filled in), `supabase` stays null and
// every feature that depends on it just no-ops. The scraper itself
// never depends on this being configured.
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          // Popups are short-lived DOM contexts, but localStorage for the
          // extension's origin persists across opens, so the session
          // (and "stay logged in") survives closing the popup.
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const cloudConfigured = !!supabase;
