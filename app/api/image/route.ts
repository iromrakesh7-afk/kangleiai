export const maxDuration = 60

export async function POST() {
  return Response.json(
    { error: 'Image generation is not available. Groq does not support image generation. Use chat or search mode instead.' },
    { status: 501 },
  )
}
