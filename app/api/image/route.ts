import { IMAGE_MODEL } from '@/lib/models'
import { experimental_generateImage as generateImage } from 'ai'

export const maxDuration = 60

export async function POST(req: Request) {
  const { prompt }: { prompt?: string } = await req.json()

  if (!prompt || !prompt.trim()) {
    return Response.json({ error: 'A prompt is required.' }, { status: 400 })
  }

  try {
    const { image } = await generateImage({
      model: IMAGE_MODEL,
      prompt,
      size: '1024x1024',
    })

    return Response.json({
      image: `data:${image.mediaType ?? 'image/png'};base64,${image.base64}`,
    })
  } catch (err) {
    console.log('[v0] image generation failed:', (err as Error).message)
    return Response.json(
      { error: 'Image generation failed. Please try again.' },
      { status: 500 },
    )
  }
}
