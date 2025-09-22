'use server'

import { revalidatePath } from 'next/cache'
import { generateEmbedding } from '@/lib/ai/embed'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function createNote(formData: FormData): Promise<void> {
  const content = formData.get('content') as string
  const supabase = createServerActionClient({ cookies })

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // This should ideally redirect to login or show a more specific error
    throw new Error('User is not authenticated. Please log in to create a note.')
  }
  
  if (!content || content.trim() === '') {
    throw new Error('Le contenu de la note est requis')
  }

  try {
    // 2. Generate embedding
    const embedding = await generateEmbedding(content)

    // 3. Insert the new note with the user_id
    const { data, error } = await supabase
      .from('notes')
      .insert({ content, embedding, user_id: user.id })
      .select()
      .single()

    if (error) {
      // This could be a DB error or an RLS error if policies are not set up correctly
      console.error('Database error:', error.message)
      throw new Error(`Database error: ${error.message}`)
    }

    // 4. Revalidate paths
    revalidatePath('/test-architecture')
    revalidatePath('/')

    console.log('✅ Note created successfully for user:', user.id, data)

  } catch (error) {
    console.error('❌ Error creating note:', error)
    // Re-throw a more generic error to the client for security
    throw new Error('Failed to create note.')
  }
}

export async function findSimilarNotes(noteId: number): Promise<{ data?: any[]; error?: string }> {
  if (!noteId) {
    return { error: 'Note ID is required.' }
  }

  const supabase = createServerActionClient({ cookies })

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'User is not authenticated.' }
  }

  // 2. Get the embedding of the source note
  const { data: sourceNote, error: sourceError } = await supabase
    .from('notes')
    .select('embedding')
    .eq('id', noteId)
    .eq('user_id', user.id) // Security check: ensure the note belongs to the user
    .single()

  if (sourceError || !sourceNote || !sourceNote.embedding) {
    console.error('Error fetching source note:', sourceError?.message)
    return { error: 'Could not find the source note or its embedding.' }
  }

  // 3. Call the database function to find similar notes
  const { data: similarNotes, error: rpcError } = await supabase.rpc('match_notes', {
    query_embedding: sourceNote.embedding,
    match_threshold: 0.75, // Adjust this threshold as needed
    match_count: 5,
  })

  if (rpcError) {
    console.error('Error calling RPC function:', rpcError.message)
    return { error: 'Failed to find similar notes.' }
  }

  // 4. Filter out the source note itself from the results
  const filteredNotes = similarNotes.filter((note: any) => note.id !== noteId)

  return { data: filteredNotes }
}
