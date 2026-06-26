import { CHAT_MODELS, SEARCH_MODEL, SUPPORTED_LANGUAGES, type ChatMode } from '@/lib/models'
import { saveChat } from '@/app/actions/chats'
import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai'
import { openai } from '@ai-sdk/openai'

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

  // Use OpenRouter through OpenAI-compatible API
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('[v0] OPENROUTER_API_KEY not configured')
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  console.log('[v0] Chat request - Model:', selectedModel, 'Language:', language)

  const result = streamText({
    model: openai(selectedModel, {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'HTTP-Referer': process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000',
        'X-Title': 'Kanglei AI',
      },
    }),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      return error instanceof Error ? error.message : String(error)
    },
    originalMessages: messages,
    onFinish: async ({ messages: allMessages, isAborted }) => {
      if (isAborted) return
      if (chatId) {
        try {
          await saveChat(chatId, allMessages)
        } catch (err) {
          console.log('[v0] saveChat failed:', (err as Error).message)
        }
      }
    },
    consumeSseStream: consumeStream,
  })
}
