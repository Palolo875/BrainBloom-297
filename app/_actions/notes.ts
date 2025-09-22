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
