'use server'

import { supabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNote(formData: FormData): Promise<void> {
  const content = formData.get('content') as string
  
  if (!content || content.trim() === '') {
    throw new Error('Le contenu de la note est requis')
  }
  try {
    // 1. Appeler en interne notre endpoint /api/embed pour obtenir le vecteur
    const embedResponse = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: content })
    })

    if (!embedResponse.ok) {
      throw new Error(`Embedding API error: ${embedResponse.statusText}`)
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

    console.log('✅ Note créée avec succès:', data[0])

  } catch (error) {
    console.error('❌ Erreur lors de la création de la note:', error)
    throw error // Laisser Next.js gérer l'erreur
  }
}