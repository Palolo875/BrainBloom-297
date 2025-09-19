import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Client standard pour les Server Components (utilise la clé anon)
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)