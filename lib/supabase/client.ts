import { createClient } from '@supabase/supabase-js'

// 1. Lire les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Vérifier qu'elles existent
if (!supabaseUrl || !supabaseAnonKey) {
  // Si elles n'existent pas, on arrête tout avec une erreur claire.
  throw new Error('Supabase URL and/ou Anon Key ne sont pas définies dans les variables d\'environnement.');
}

// 3. Créer le client uniquement si tout est OK
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


