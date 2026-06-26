import { CHAT_MODELS, SEARCH_MODEL, SUPPORTED_LANGUAGES, type ChatMode } from '@/lib/models'
import { saveChat } from '@/app/actions/chats'
import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai'

export const maxDuration = 60

const VALID_CHAT_MODELS = new Set(CHAT_MODELS.map((m) => m.id))

const BASE_SYSTEM = `You are Kanglei AI, an advanced AI assistant founded by Rakesh Irom from Manipur, India.
You are knowledgeable, warm, and take quiet pride in your Manipuri roots while serving users worldwide.
Be helpful, accurate, and concise. Use Markdown formatting for structure, lists, and code blocks when useful.`

const SEARCH_SYSTEM = `${BASE_SYSTEM}
Provide factual, well-researched answers to the user's question.
Be concise and direct. Finish your answer with a "Sources" section listing key references if applicable.`

const LANGUAGE_SYSTEMS: Record<string, string> = {
  en: BASE_SYSTEM,
  mni: `${BASE_SYSTEM}

NOTE: You are set to Manipuri language mode. Provide responses in English but with Manipuri cultural context and pride.
When relevant, mention Manipur, Meitei culture, and local references to enhance Manipuri identity in your answers.`,
}

export async function POST(req: Request) {
  const {
    messages,
    model,
    mode,
    chatId,
    language,
  }: {
    messages: UIMessage[]
    model?: string
    mode?: ChatMode
    chatId?: string
    language?: string
  } = await req.json()

  const isSearch = mode === 'search'
  const selectedLanguage = language && SUPPORTED_LANGUAGES.some(l => l.code === language) ? language : 'en'
  const selectedModel =
    isSearch
      ? SEARCH_MODEL
      : model && VALID_CHAT_MODELS.has(model)
        ? model
        : CHAT_MODELS[0].id

  let systemPrompt = isSearch ? SEARCH_SYSTEM : LANGUAGE_SYSTEMS[selectedLanguage] || BASE_SYSTEM
  if (isSearch && selectedLanguage === 'mni') {
    systemPrompt = `${BASE_SYSTEM}
Provide factual, well-researched answers to the user's question.
Be concise and direct. Finish your answer with a "Sources" section listing key references if applicable.

NOTE: You are set to Manipuri language mode. Provide responses in English but with Manipuri cultural context.
When relevant, mention Manipur, Meitei culture, and local references.`
  }

  // Get the model's OpenRouter path
  const modelConfig = CHAT_MODELS.find((m) => m.id === selectedModel)
  const modelPath = modelConfig?.modelPath || selectedModel

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  // Call OpenRouter API directly
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
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      system: systemPrompt,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    }),
    signal: req.signal,
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[v0] OpenRouter error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get response from OpenRouter' }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Stream the response as-is and handle saving chat
  if (chatId) {
    response.body?.on?.('end', async () => {
      try {
        await saveChat(chatId, messages)
      } catch (err) {
        console.log('[v0] saveChat failed:', (err as Error).message)
      }
    })
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}
