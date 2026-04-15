export const AI_MODELS = [
  {
    id: 'canopylabs/orpheus-arabic-saudi',
    name: '(Grok) Orpheus Arabic Saudi',
    provider: 'groq',
    modelId: 'canopylabs/orpheus-arabic-saudi',
    isFree: false,
    description: 'Specialized Arabic model'
  },
  {
    id: 'canopylabs/orpheus-v1-english',
    name: '(Grok) Orpheus V1 English',
    provider: 'groq',
    modelId: 'canopylabs/orpheus-v1-english',
    isFree: false,
    description: 'High quality English model'
  },
  {
    id: 'groq/compound',
    name: '(Grok) Groq Compound',
    provider: 'groq',
    modelId: 'groq/compound',
    isFree: false,
    description: 'Experimental model'
  },
  {
    id: 'groq/compound-mini',
    name: '(Grok) Groq Compound Mini',
    provider: 'groq',
    modelId: 'groq/compound-mini',
    isFree: false,
    description: 'Fast experimental model'
  },
  {
    id: 'meta-llama/llama-3.1-8b-instant',
    name: '(Grok) Llama 3.1 8B Instant',
    provider: 'groq',
    modelId: 'llama-3.1-8b-instant',
    isFree: true,
    description: 'Fast Llama 3.1 model'
  },
  {
    id: 'meta-llama/llama-3.3-70b-versatile',
    name: '(Grok) Llama 3.3 70B Versatile',
    provider: 'groq',
    modelId: 'llama-3.3-70b-versatile',
    isFree: false,
    description: 'Powerful Llama 3.3'
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruction',
    name: '(Grok) Llama 4 Scout 17B Preview',
    provider: 'groq',
    modelId: 'meta-llama/llama-4-scout-17b-16e-instruction',
    isFree: false,
    description: 'Next-gen Llama preview'
  },
  {
    id: 'meta-llama/llama-prompt-guard-2-22m',
    name: '(Grok) Llama Prompt Guard 2 22M',
    provider: 'groq',
    modelId: 'meta-llama/llama-prompt-guard-2-22m',
    isFree: false,
    description: 'Security focused model'
  },
  {
    id: 'meta-llama/llama-prompt-guard-2-86m',
    name: '(Grok) Llama Prompt Guard 2 86M',
    provider: 'groq',
    modelId: 'meta-llama/llama-prompt-guard-2-86m',
    isFree: false,
    description: 'Advanced safety model'
  },
  {
    id: 'moonshotai/kimi-k2-instruct',
    name: '(Grok) Moonshot Kimi K2 Instruct',
    provider: 'groq',
    modelId: 'moonshotai/kimi-k2-instruct',
    isFree: false,
    description: 'Instruction following'
  },
  {
    id: 'openai/gpt-oss-120b',
    name: '(Grok) GPT OSS 120B',
    provider: 'groq',
    modelId: 'openai/gpt-oss-120b', 
    isFree: false,
    description: 'Large scale OSS model'
  },
  {
    id: 'openai/gpt-oss-20b',
    name: '(Grok) GPT OSS 20B',
    provider: 'groq',
    modelId: 'openai/gpt-oss-20b', 
    isFree: false,
    description: 'Compact OSS model'
  },
  {
    id: 'openai/gpt-oss-safeguard-20b',
    name: '(Grok) GPT OSS Safeguard 20B',
    provider: 'groq',
    modelId: 'openai/gpt-oss-safeguard-20b', 
    isFree: false,
    description: 'Safe OSS model'
  },
  {
    id: 'whisper-large-v3',
    name: '(Grok) Whisper Large V3',
    provider: 'groq',
    modelId: 'whisper-large-v3',
    isFree: false,
    description: 'Audio transcription (as text model)'
  },
  {
    id: 'whisper-large-v3-turbo',
    name: '(Grok) Whisper Large V3 Turbo',
    provider: 'groq',
    modelId: 'whisper-large-v3-turbo',
    isFree: false,
    description: 'Fast audio model'
  },
  {
    id: 'openrouter/auto-free',
    name: '(OpenRouter) Auto (Best Free)',
    provider: 'openrouter',
    modelId: 'openrouter/auto:free',
    isFree: true,
    description: 'Auto-selects best free model'
  }
];

export const DEFAULT_MODEL = AI_MODELS[4]; // Defaulting to Llama 3.1 8B Instant
