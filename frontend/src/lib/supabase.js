import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  typeof rawUrl === 'string' &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('example.com')
);

// Fallback dummy URL so createClient does not crash module initialization when unconfigured
const supabaseUrl = isSupabaseConfigured ? rawUrl.trim() : 'https://placeholder.supabase.co';
const supabaseKey = isSupabaseConfigured ? rawKey.trim() : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'smart_crop_supabase_auth'
  }
});

export const getSupabaseConfigStatus = () => {
  return {
    isConfigured: isSupabaseConfigured,
    url: rawUrl ? rawUrl.trim() : null,
    hasKey: Boolean(rawKey)
  };
};
