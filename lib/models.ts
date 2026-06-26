export type ModelId = string

export interface ModelOption {
  id: ModelId
  name: string
  provider: string
  description: string
  modelPath?: string
}

// OpenRouter models — using OpenRouter API for multi-model support
// All models are currently active as of June 2026.
export const CHAT_MODELS: ModelOption[] = [
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Kanglei Pro',
    provider: 'Meta Llama 3.3 70B',
    description: 'Most capable model, excellent reasoning',
    modelPath: 'meta-llama/llama-3.3-70b-instruct',
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b',
    name: 'Kanglei Reason',
    provider: 'Nvidia Nemotron 3 Ultra',
    description: 'Advanced reasoning for complex tasks',
    modelPath: 'nvidia/nemotron-3-ultra-550b-a55b',
  },
  {
    id: 'alibaba/happyhorse-1.0',
    name: 'Kanglei Flash',
    provider: 'Alibaba Happy Horse 1.0',
    description: 'Fast, efficient responses',
    modelPath: 'alibaba/happyhorse-1.0',
  },
  {
    id: 'cohere/north-mini-code',
    name: 'Kanglei Lite',
    provider: 'Cohere North Mini Code',
    description: 'Quick everyday answers & code',
    modelPath: 'cohere/north-mini-code',
  },
]

export const DEFAULT_MODEL: ModelId = CHAT_MODELS[0].id

// For OpenRouter: use the fastest model for search mode
export const SEARCH_MODEL = 'cohere/north-mini-code'

// Image generation using Google Imagen via Vertex AI
export const IMAGE_MODEL = 'google-imagen-3.0-generate-001'

// Supported languages for Kanglei AI
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'mni', name: 'Manipuri', nativeName: 'ꯀꯤꯇꯩ ꯃꯌꯦꯛ' },
] as const

export const DEFAULT_LANGUAGE = 'en'

export function getModelName(id: string): string {
  return CHAT_MODELS.find((m) => m.id === id)?.name ?? 'Kanglei AI'
}

export type ChatMode = 'chat' | 'search' | 'image'
