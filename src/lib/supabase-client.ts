import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://pcxgwkcpgbkavgovhvzg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeGd3a2NwZ2JrYXZnb3ZodnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjQxMTIsImV4cCI6MjA2MTUwMDExMn0.awyht15cRk9lM_U2O5zFjYwUme0zyvqG8U0iu_-5_TQ'
) 