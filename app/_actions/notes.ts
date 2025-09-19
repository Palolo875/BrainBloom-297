'use server'

import { supabase } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/embed'
import { revalidatePath } from 'next/cache'

export async function createNote(formData: FormData): Promise<void> {
  const content = formData.get('content') as string
  
  if (!content || content.trim() === '') {
    throw new Error('Le contenu de la note est requis')
  }
  try {
    // 1. Générer l'embedding directement via le helper (plus efficace qu'un appel HTTP)
    const embedding = await generateEmbedding(content)

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

    console.log('✅ Note créée avec succès:', data[0])

  } catch (error) {
    console.error('❌ Erreur lors de la création de la note:', error)
    throw error // Laisser Next.js gérer l'erreur
  }
}