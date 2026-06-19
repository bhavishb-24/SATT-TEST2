import type { LanguageModel } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

/**
 * Gemini is powered directly by a Google AI Studio API key
 * (GOOGLE_GENERATIVE_AI_API_KEY) — no credit card or Vercel AI Gateway billing
 * required. If the key is missing, the chain is empty and the API routes fall
 * back to their deterministic non-AI output.
 *
 * Per the product requirement, Gemini generates the study plan, practice
 * questions, and the diagnostic review.
 */

const googleApiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY

const google = googleApiKey
  ? createGoogleGenerativeAI({ apiKey: googleApiKey })
  : null

export const hasAIKeys = !!google

export interface ModelAttempt {
  provider: string
  model: LanguageModel
}

/** Text/structured generation chain. Gemini (direct API key). */
export function textModelChain(): ModelAttempt[] {
  if (!google) return []
  return [
    { provider: 'Gemini 2.5 Flash', model: google('gemini-2.5-flash') },
    { provider: 'Gemini 2.0 Flash', model: google('gemini-2.0-flash') },
  ]
}

/** Vision chain for reading uploaded score reports (Gemini is multimodal). */
export function visionModelChain(): ModelAttempt[] {
  if (!google) return []
  return [
    { provider: 'Gemini 2.5 Flash', model: google('gemini-2.5-flash') },
    { provider: 'Gemini 2.0 Flash', model: google('gemini-2.0-flash') },
  ]
}
