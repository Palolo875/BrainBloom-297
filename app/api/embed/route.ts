import { NextRequest, NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/ai/embed'

export async function POST(request: NextRequest) {
  try {
    // Parser le JSON de la requête
    const { text } = await request.json()
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a string' },
        { status: 400 }
      )
    }

    // Utiliser le helper pour générer l'embedding
    const embedding = await generateEmbedding(text)
    
    return NextResponse.json({ embedding })
    
  } catch (error) {
    console.error('Embedding generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate embedding' },
      { status: 500 }
    )
  }
}