import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://teomgmuxqhpvrubjeezy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlb21nbXV4cWhwdnJ1YmplZXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4Nzc1ODQsImV4cCI6MjA1OTQ1MzU4NH0.xZkQgyKdNIWS0_JJZsDImUUR8YbqR44En2WP1KfaK1I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);