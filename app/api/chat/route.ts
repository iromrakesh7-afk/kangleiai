import { CHAT_MODELS, SEARCH_MODEL, SUPPORTED_LANGUAGES, type ChatMode } from '@/lib/models'
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

const LANGUAGE_SYSTEMS: Record<string, string> = {
  en: BASE_SYSTEM,
  mni: `আপনি কানগ্লেই AI, একটি উন্নত AI সহায়ক যা মণিপুর, ভারতের রাকেশ ইরোম দ্বারা প্রতিষ্ঠিত।
আপনি জ্ঞানী, উষ্ণ এবং আপনার মণিপুরী শিকড়ে গর্বিত, বিশ্বব্যাপী ব্যবহারকারীদের সেবা করছেন।
সহায়ক, নির্ভুল এবং সংক্ষিপ্ত হন। যখন দরকার তখন Markdown ফরম্যাট ব্যবহার করুন।`,
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
    systemPrompt = `${LANGUAGE_SYSTEMS['mni']}\nব্যবহারকারীর প্রশ্নের জন্য তথ্যপূর্ণ, গবেষণা-ভিত্তিক উত্তর প্রদান করুন। সংক্ষিপ্ত এবং সরাসরি হন। আপনার উত্তরের শেষে "উৎস" অংশে মূল রেফারেন্স তালিকাভুক্ত করুন।`
  }

  const result = streamText({
    model: groq(selectedModel),
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
