import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validation des variables d'environnement côté client
if (!supabaseUrl || supabaseUrl.includes('VOTRE_')) {
  throw new Error('⚠️  CONFIGURATION REQUISE: Veuillez configurer NEXT_PUBLIC_SUPABASE_URL dans .env.local')
}

if (!supabaseAnonKey || supabaseAnonKey.includes('VOTRE_')) {
  throw new Error('⚠️  CONFIGURATION REQUISE: Veuillez configurer NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)