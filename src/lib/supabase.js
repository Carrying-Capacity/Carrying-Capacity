import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://einrwmetibudwftelsha.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbnJ3bWV0aWJ1ZHdmdGVsc2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzY3NzEsImV4cCI6MjA3NTQxMjc3MX0.AQEmron0NttEEU9LzWy2u2WJpE28xp0SoQPUPTU9vHc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)