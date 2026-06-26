import { CHAT_MODELS } from '@/lib/models'

export async function POST(request: Request) {
  try {
    const { messages, model, temperature, max_tokens } = await request.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'OPENROUTER_API_KEY not configured',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Find the model's OpenRouter path
    const selectedModel = CHAT_MODELS.find((m) => m.id === model)
    const modelPath = selectedModel?.modelPath || model

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000',
        'X-Title': 'Kanglei AI',
      },
      body: JSON.stringify({
        model: modelPath,
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[v0] OpenRouter API error:', error)
      return new Response(
        JSON.stringify({
          error: `OpenRouter API error: ${response.statusText}`,
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Stream the response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
