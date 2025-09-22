import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { JournalingSystem } from '@/components/journaling-system'
import Link from 'next/link'
import { redirect } from 'next/navigation'

// This type definition will be the source of truth for journal entries.
// We will use it in the JournalingSystem component as well.
export type JournalEntryFromDB = {
  id: number;
  user_id: string;
  created_at: string;
  entry_date: string; // Comes as string from DB
  content: string | null;
  mood: number;
  energy: number;
  activities: string[] | null;
  gratitude: string | null;
  learned: string | null;
}

export default async function JournalPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-4">Veuillez vous connecter</h2>
            <p className="text-gray-600 mb-6">
                Pour accéder à votre journal, vous devez être connecté.
            </p>
            <Link href="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
                    Aller à la page de connexion
                </button>
            </Link>
        </div>
    )
  }

  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })

  if (error) {
    console.error('Error fetching journal entries:', error.message)
    // You might want a more user-friendly error message here
    return <div className="text-center text-red-500 p-8">Erreur lors du chargement des entrées du journal.</div>
  }

  // The 'onBack' prop is no longer needed as the component will handle its own navigation.
  // We'll modify the component to use useRouter instead.
  return (
    <JournalingSystem initialEntries={entries || []} />
  )
}
