/**
 * AI providers via Vercel AI Gateway — zero-config, no API key required.
 * Routes that previously needed OPENAI_API_KEY now work out of the box.
 * The hasAIKeys flag is kept for backwards compatibility (always true).
 */

export const hasAIKeys = true

export interface ModelAttempt {
  provider: string
  model: string
}

/** Text / structured generation chain. GPT-4o primary, GPT-4o-mini fallback. */
export function textModelChain(): ModelAttempt[] {
  return [
    { provider: 'GPT-4o',      model: 'openai/gpt-4o'      },
    { provider: 'GPT-4o-mini', model: 'openai/gpt-4o-mini' },
  ]
}

/** Vision chain for reading uploaded score reports. GPT-4o has native vision. */
export function visionModelChain(): ModelAttempt[] {
  return [
    { provider: 'GPT-4o', model: 'openai/gpt-4o' },
  ]
}
