import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Vérifier la présence du token HF
    const hfToken = process.env.HF_TOKEN
    if (!hfToken) {
      return NextResponse.json(
        { error: 'Hugging Face token not configured' },
        { status: 500 }
      )
    }

    // Parser le JSON de la requête
    const { text } = await request.json()
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a string' },
        { status: 400 }
      )
    }

    // Appel à l'API Hugging Face pour le modèle sentence-transformers
    const response = await fetch(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`)
    }

    // Récupérer l'embedding depuis la réponse
    const embedding = await response.json()
    
    return NextResponse.json({ embedding })
    
  } catch (error) {
    console.error('Embedding generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    )
  }
}