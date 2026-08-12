import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // This is expected during local builds before .env.local is filled in.
  // The app will still compile; it just can't reach a database until these are set.
  console.warn('Supabase env vars are not set yet — see README.md "Deploy it" section.');
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-key');
