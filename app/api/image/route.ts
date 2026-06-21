import { generateImage } from 'ai'
import { google } from '@ai-sdk/google'

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

    // Use Google Imagen 3 for image generation via AI SDK
    const result = await generateImage({
      model: google.imageModel('imagen-3.0-generate-001'),
      prompt: prompt,
      size: '1024x1024',
    })

    // Convert image to data URL for display
    const imageBase64 = result.image.base64
    const dataUrl = `data:image/png;base64,${imageBase64}`

    return Response.json({
      image: dataUrl,
      prompt,
    })
  } catch (error) {
    console.error('[v0] Image generation error:', error instanceof Error ? error.message : String(error))
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Image generation failed. Please try again.',
      },
      { status: 500 }
    )
  }
}
