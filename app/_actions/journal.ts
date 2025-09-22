'use server'

import { revalidatePath } from 'next/cache'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { formatISO } from 'date-fns'
import { generateEmbedding } from '@/lib/ai/embed'

// Define the schema for validation using Zod
const journalEntrySchema = z.object({
  entry_date: z.string().transform((str) => new Date(str)),
  content: z.string().optional(),
  mood: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  activities: z.array(z.string()).optional(),
  gratitude: z.string().optional(),
  learned: z.string().optional(),
})

export async function saveJournalEntry(payload: any) {
  const supabase = createServerActionClient({ cookies })

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: { message: 'User is not authenticated.' } }
  }

  // 2. Validate payload
  const validated = journalEntrySchema.safeParse(payload)
  if (!validated.success) {
    return { error: { message: 'Invalid data provided.', details: validated.error.issues } }
  }

  const { entry_date, content, gratitude, learned, ...restOfData } = validated.data

  // 3. Generate embedding from text fields
  const textToEmbed = [
    `Humeur: ${restOfData.mood}/5, Energie: ${restOfData.energy}/5`,
    content,
    gratitude ? `Gratitude: ${gratitude}` : '',
    learned ? `Apprentissage: ${learned}` : ''
  ].filter(Boolean).join('\n\n');

  let embedding;
  try {
    embedding = await generateEmbedding(textToEmbed);
  } catch (e: any) {
      console.error('Failed to generate embedding for journal entry:', e.message);
      return { error: { message: 'Failed to analyze journal entry with AI.' } }
  }

  const dataToUpsert = {
    ...restOfData,
    content,
    gratitude,
    learned,
    embedding, // Add the new embedding
    user_id: user.id,
    entry_date: formatISO(entry_date, { representation: 'date' }),
  }

  try {
    // 4. Upsert data into the database
    // 'upsert' will INSERT a new row or UPDATE it if a row with the same
    // unique key (user_id, entry_date) already exists.
    const { data, error } = await supabase
      .from('journal_entries')
      .upsert(dataToUpsert, {
        onConflict: 'user_id, entry_date',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error.message)
      return { error: { message: `Database error: ${error.message}` } }
    }

    // 4. Revalidate the path to update the UI
    // We assume the journal will be on a '/journal' page.
    revalidatePath('/journal')
    revalidatePath('/') // Also revalidate home if it shows journal data

    console.log('✅ Journal entry saved successfully for user:', user.id, data)
    return { data }

  } catch (e: any) {
    console.error('❌ Error saving journal entry:', e)
    return { error: { message: 'Failed to save journal entry.' } }
  }
}

export async function findSimilarJournalEntries(entryId: number) {
  if (!entryId) {
    return { error: { message: 'Entry ID is required.' } };
  }

  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'User is not authenticated.' } };
  }

  const { data: sourceEntry, error: sourceError } = await supabase
    .from('journal_entries')
    .select('embedding')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .single();

  if (sourceError || !sourceEntry?.embedding) {
    console.error('Error fetching source journal entry:', sourceError?.message);
    return { error: { message: 'Could not find the source journal entry.' } };
  }

  const { data, error: rpcError } = await supabase.rpc('match_journal_entries', {
    query_embedding: sourceEntry.embedding,
    match_threshold: 0.78, // Threshold can be tuned
    match_count: 3,
    source_entry_id: entryId,
  });

  if (rpcError) {
    console.error('Error finding similar journal entries:', rpcError);
    return { error: { message: 'Failed to find similar entries.' } };
  }

  return { data };
}
