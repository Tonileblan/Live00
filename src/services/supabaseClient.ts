import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://demo-sobriety.supabase.co').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl !== 'https://demo-sobriety.supabase.co'
);

export const supabase = createClient(rawUrl, rawKey);

