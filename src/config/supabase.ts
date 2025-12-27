import { createClient } from '@supabase/supabase-js';

// Supabase connection for HomeHub.
// Note: The anon key is safe to use in client apps; access is controlled via RLS.
// For production, prefer sourcing these from environment variables instead of hard-coding.

const SUPABASE_URL = 'https://facnpdpzhxvybisxlpbp.supabase.co';

// Full anon key as provided – consider moving to EXPO_PUBLIC_SUPABASE_ANON_KEY.
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY25wZHB6aHh2eWJpc3hscGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NTUxNDAsImV4cCI6MjA4MTMzMTE0MH0.NKUvgV7wEWGdVkk1AnQEIrfJbzr4oRCD1A6PYphC9ZI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type SupabaseClient = typeof supabase;


