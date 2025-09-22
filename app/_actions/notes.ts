'use server'

import { revalidatePath } from 'next/cache'
import { generateEmbedding } from '@/lib/ai/embed'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const noteSchema = z.object({
    title: z.string().min(3, "Le titre doit contenir au moins 3 caractères."),
    content: z.string().optional(),
    // Tags will be a comma-separated string from the form
    tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()) : []),
});


export async function createNote(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: { message: 'Authentication required.' } }
  }

  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
    tags: formData.get('tags'),
  }

  const validated = noteSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: { message: 'Invalid data.', details: validated.error.issues } }
  }

  const { title, content, tags } = validated.data;

  // An embedding is generated from the title and content for better semantic search
  const textToEmbed = `${title}\n${content || ''}`;

  try {
    const embedding = await generateEmbedding(textToEmbed)

    const { data, error } = await supabase
      .from('notes')
      .insert({
        title,
        content,
        tags,
        embedding,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error.message)
      return { error: { message: `Database error: ${error.message}` } }
    }

    revalidatePath('/test-architecture')
    revalidatePath('/graph') // Also revalidate graph page
    revalidatePath('/')

    return { data }

  } catch (e: any) {
    console.error('Error creating note:', e)
    return { error: { message: 'Failed to create note.' } }
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
