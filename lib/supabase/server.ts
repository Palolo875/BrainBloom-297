import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// Validation des variables d'environnement
if (!supabaseUrl || supabaseUrl.includes('VOTRE_')) {
  throw new Error('⚠️  CONFIGURATION REQUISE: Veuillez configurer SUPABASE_URL dans .env.local avec votre vraie URL Supabase')
}

if (!supabaseAnonKey || supabaseAnonKey.includes('VOTRE_')) {
  throw new Error('⚠️  CONFIGURATION REQUISE: Veuillez configurer SUPABASE_ANON_KEY dans .env.local avec votre vraie clé Supabase')
}

// Client admin (optionnel - seulement si la clé service role est configurée)
export const supabaseAdmin = supabaseServiceRoleKey && !supabaseServiceRoleKey.includes('VOTRE_')
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Client standard pour les Server Components (utilise la clé anon)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)