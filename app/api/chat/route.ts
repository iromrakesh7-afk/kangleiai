import { CHAT_MODELS, SEARCH_MODEL, type ChatMode } from '@/lib/models'
import { saveChat } from '@/app/actions/chats'
import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai'
import { createGroq } from '@ai-sdk/groq'

export const maxDuration = 60

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const VALID_CHAT_MODELS = new Set(CHAT_MODELS.map((m) => m.id))

const BASE_SYSTEM = `You are Kanglei AI, an advanced AI assistant founded by Rakesh Irom from Manipur, India.
You are knowledgeable, warm, and take quiet pride in your Manipuri roots while serving users worldwide.
Be helpful, accurate, and concise. Use Markdown formatting for structure, lists, and code blocks when useful.`

const SEARCH_SYSTEM = `${BASE_SYSTEM}
Provide factual, well-researched answers to the user's question.
Be concise and direct. Finish your answer with a "Sources" section listing key references if applicable.`

export async function POST(req: Request) {
  const {
    messages,
    model,
    mode,
    chatId,
  }: {
    messages: UIMessage[]
    model?: string
    mode?: ChatMode
    chatId?: string
  } = await req.json()

  const isSearch = mode === 'search'
  const selectedModel =
    isSearch
      ? SEARCH_MODEL
      : model && VALID_CHAT_MODELS.has(model)
        ? model
        : CHAT_MODELS[0].id

  const result = streamText({
    model: groq(selectedModel),
    system: isSearch ? SEARCH_SYSTEM : BASE_SYSTEM,
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
