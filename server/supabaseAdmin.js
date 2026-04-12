import { createClient } from '@supabase/supabase-js';

let cached = null;

/**
 * Lazy-init so process.env is read after dotenv.config() runs in index.js
 * (ESM evaluates imported modules before the rest of the entry file).
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return null;
  }
  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
