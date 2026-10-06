import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create the client if we have the credentials.
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url_here') 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Export a helper to check if Supabase is connected
export const isSupabaseConfigured = () => supabase !== null;
