import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createNote } from '@/app/_actions/notes'
import Link from 'next/link'

export default async function TestArchitecturePage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let notes: any[] | null = []
  let error: any = null

  if (user) {
    const { data, error: queryError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id) // Only fetch notes for the logged-in user
      .order('created_at', { ascending: false })

    notes = data
    error = queryError
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧠 Test Architecture BrainBloom</h1>
        <p className="text-gray-600">
          Cette page teste l'architecture backend : Server Components + Server Actions + Supabase + IA
        </p>
      </div>

      {user ? (
        <>
          {/* Formulaire de création de note (visible only when logged in) */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">✍️ Créer une nouvelle note</h2>
            <form action={createNote} className="space-y-4">
              <div>
                 <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre
                </label>
                <input
                  id="title"
                  name="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre de votre note"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu de la note (optionnel)
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Écrivez votre note ici..."
                />
              </div>
               <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <input
                  id="tags"
                  name="tags"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: idée, projet, urgent"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                🚀 Créer la note (avec IA)
              </button>
            </form>
          </div>

          {/* Liste des notes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📚 Vos Notes</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Erreur :</strong> {error.message}
              </div>
            )}

            {notes && notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-2">{note.title}</h3>
                    <div className="mb-3">
                      <p className="text-gray-800">{note.content}</p>
                    </div>
                    {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {note.tags.map((tag: string) => (
                                <span key={tag} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{tag}</span>
                            ))}
                        </div>
                    )}
                    <div className="text-xs text-gray-400">
                      <details>
                        <summary className="cursor-pointer hover:text-gray-600">
                          🧠 Voir l'embedding IA ({note.embedding?.length || 0} dimensions)
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {note.embedding ? JSON.stringify(note.embedding.slice(0, 10), null, 2) + '...' : 'Pas d\'embedding'}
                        </pre>
                      </details>
                    </div>
                     <div className="text-right text-xs text-gray-500 mt-2">
                        ID: {note.id} | Créée le : {new Date(note.created_at).toLocaleString('fr-FR')}
                      </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>📝 Aucune note pour le moment.</p>
                <p className="text-sm mt-2">Créez votre première note ci-dessus pour tester l'architecture !</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                💡 <strong>Architecture testée :</strong> Server Component → Supabase → Server Action → Hugging Face API
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Veuillez vous connecter</h2>
            <p className="text-gray-600 mb-6">
                Pour créer et voir vos notes, vous devez être connecté.
            </p>
            <Link href="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
                    Aller à la page de connexion
                </button>
            </Link>
        </div>
      )}
    </div>
  )
}
