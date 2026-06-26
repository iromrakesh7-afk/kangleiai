export type ModelId = string

// OpenAI GPT-4o — using OpenAI API with OPENAI_API_KEY_2
export const CHAT_MODEL = 'gpt-4o'
export const SEARCH_MODEL = 'gpt-4o-mini'

export const DEFAULT_MODEL: ModelId = CHAT_MODEL

// Image generation using Google Imagen via Vertex AI
export const IMAGE_MODEL = 'google-imagen-3.0-generate-001'

// Supported languages for Kanglei AI
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'mni', name: 'Manipuri', nativeName: 'ꯀꯤꯇꯩ ꯃꯌꯦꯛ' },
] as const

export const DEFAULT_LANGUAGE = 'en'

export function getModelName(id: string): string {
  return 'Kanglei AI'
}

export type ChatMode = 'chat' | 'search' | 'image'
