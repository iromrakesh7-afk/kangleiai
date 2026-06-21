export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt: string }

    if (!prompt || typeof prompt !== 'string') {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Use Google Vertex AI Imagen via the Vercel AI SDK
    // For now, return a placeholder until full integration is available
    // In production, this would call: google/imagen-3.0-generate-001

    const response = await fetch(
      'https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/endpoints/openapi/batchPredict',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GOOGLE_IMAGEN_API_KEY}`,
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Imagen API error: ${response.statusText}`)
    }

    const data = await response.json() as {
      predictions?: Array<{ bytesBase64Encoded: string }>
    }
    const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded

    if (!imageBase64) {
      throw new Error('No image generated')
    }

    return Response.json({
      image: `data:image/png;base64,${imageBase64}`,
      prompt,
    })
  } catch (error) {
    console.error('[v0] Image generation error:', error)
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Image generation failed',
      },
      { status: 500 }
    )
  }
}
