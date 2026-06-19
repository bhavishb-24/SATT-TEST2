import type { LanguageModel } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

/**
 * OpenAI powers all AI features — study plan, practice questions, diagnostic
 * review, and score-report image analysis. Requires OPENAI_API_KEY. If the
 * key is missing, all chains are empty and every route falls back to its
 * deterministic non-AI output.
 */

const openaiInstance = process.env.OPENAI_API_KEY
  ? createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export const hasAIKeys = !!openaiInstance

export interface ModelAttempt {
  provider: string
  model: LanguageModel
}

/** Text / structured generation chain. GPT-4o primary, GPT-4o-mini fallback. */
export function textModelChain(): ModelAttempt[] {
  if (!openaiInstance) return []
  return [
    { provider: 'GPT-4o', model: openaiInstance('gpt-4o') },
    { provider: 'GPT-4o-mini', model: openaiInstance('gpt-4o-mini') },
  ]
}

/** Vision chain for reading uploaded score reports. GPT-4o has native vision. */
export function visionModelChain(): ModelAttempt[] {
  if (!openaiInstance) return []
  return [
    { provider: 'GPT-4o', model: openaiInstance('gpt-4o') },
  ]
}
