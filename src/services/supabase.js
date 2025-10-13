import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wqantyskaaipaakctexh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxYW50eXNrYWFpcGFha2N0ZXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzEwNTcsImV4cCI6MjA3NTg0NzA1N30.67UzqnL6QbD1TnBRqeDjYof4IvJH_6A8UiW8_Pc0R0g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);