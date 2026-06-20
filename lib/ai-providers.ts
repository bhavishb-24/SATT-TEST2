/**
 * AI providers via the Vercel AI Gateway.
 *
 * The AI SDK uses the gateway by default — model strings are passed directly
 * (e.g. 'openai/gpt-4o') with no provider package or API key required.
 * The Vercel AI Gateway integration must be connected in the project settings.
 */

export const hasAIKeys = true

export interface ModelAttempt {
  provider: string
  model: string
}

/** Text / structured generation chain. GPT-4o primary, GPT-4o-mini fallback. */
export function textModelChain(): ModelAttempt[] {
  return [
    { provider: 'GPT-4o', model: 'openai/gpt-4o' },
    { provider: 'GPT-4o-mini', model: 'openai/gpt-4o-mini' },
  ]
}

/** Vision chain for reading uploaded score reports. GPT-4o has native vision. */
export function visionModelChain(): ModelAttempt[] {
  return [
    { provider: 'GPT-4o', model: 'openai/gpt-4o' },
  ]
}
