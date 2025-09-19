'use server'

import { supabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNote(content: string) {
  try {
    // 1. Appeler notre endpoint /api/embed pour obtenir le vecteur
    const embedResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content }),
    })

    if (!embedResponse.ok) {
      throw new Error('Failed to generate embedding')
    }

    const { embedding } = await embedResponse.json()

    // 2. Insérer la nouvelle note dans Supabase avec son embedding
    const { data, error } = await supabase
      .from('notes')
      .insert({
        content,
        embedding,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // 3. Rafraîchir la page des notes
    revalidatePath('/test-architecture')
    revalidatePath('/')

    return { success: true, note: data[0] }

  } catch (error) {
    console.error('Create note error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create note' 
    }
  }
}