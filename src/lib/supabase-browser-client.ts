import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Fallback values if environment variables are not available
const FALLBACK_URL = 'https://pcxgwkcpgbkavgovhvzg.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeGd3a2NwZ2JrYXZnb3ZodnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjQxMTIsImV4cCI6MjA2MTUwMDExMn0.awyht15cRk9lM_U2O5zFjYwUme0zyvqG8U0iu_-5_TQ';

export const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY
}); 