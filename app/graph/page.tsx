import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GraphVisualization } from '@/components/graph-visualization'
import Link from 'next/link'

// We will need to define the types for the props we pass to the graph
export type NoteForGraph = {
  id: number;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export type ConnectionForGraph = {
    note_a_id: number;
    note_b_id: number;
}

export default async function GraphPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-4">Veuillez vous connecter</h2>
            <p className="text-gray-600 mb-6">
                Pour accéder à votre graphe de notes, vous devez être connecté.
            </p>
            <Link href="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
                    Aller à la page de connexion
                </button>
            </Link>
        </div>
    )
  }

  // 1. Fetch all notes for the user
  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('id, title, content, tags, created_at, updated_at')
    .eq('user_id', user.id)

  if (notesError) {
    console.error('Error fetching notes for graph:', notesError.message)
    return <div className="text-center text-red-500 p-8">Erreur lors du chargement des notes.</div>
  }

  // 2. Fetch all connections for the user's notes
  // This is a bit more complex. We need to get all connections where either note_a_id or note_b_id
  // is one of the user's notes. A simple way is to get all connections and filter, but that's not scalable.
  // A better way is to use an RPC function or a more complex query.
  // For now, let's fetch connections related to the notes we just got.
  const noteIds = notes.map(n => n.id);
  const { data: connections, error: connectionsError } = await supabase
    .from('note_connections')
    .select('note_a_id, note_b_id')
    .in('note_a_id', noteIds)

  if (connectionsError) {
    console.error('Error fetching connections for graph:', connectionsError.message)
    return <div className="text-center text-red-500 p-8">Erreur lors du chargement des connexions.</div>
  }

  return (
    <GraphVisualization initialNotes={notes || []} initialConnections={connections || []} />
  )
}
