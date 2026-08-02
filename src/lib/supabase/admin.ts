import { createClient } from '@supabase/supabase-js'

// IMPORTANT: This client uses the SERVICE ROLE KEY and will bypass RLS.
// It MUST NEVER be exported to or used within Client Components.
// It should ONLY be used in Server Actions, Route Handlers or Server Components
// after proper authorization checks (e.g., verifying the user's role/store ownership).

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables.')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
