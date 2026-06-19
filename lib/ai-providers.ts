import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

/**
 * Direct provider access using the project's own API keys (no AI Gateway / no
 * credit card required). Up to three keys per provider are supported so a
 * rate-limited or revoked key automatically fails over to the next one.
 */

function collectKeys(...names: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const name of names) {
    const value = process.env[name]
    if (value && value.trim().length > 0 && !seen.has(value)) {
      seen.add(value)
      out.push(value.trim())
    }
  }
  return out
}

const ANTHROPIC_KEYS = collectKeys(
  'ANTHROPIC_API_KEY',
  'ANTHROPIC_API_KEY_2',
  'ANTHROPIC_API_KEY_3',
)
const OPENAI_KEYS = collectKeys('OPENAI_API_KEY', 'OPENAI_API_KEY_2', 'OPENAI_API_KEY_3')

const ANTHROPIC_MODEL = 'claude-sonnet-4-5'
const OPENAI_MODEL = 'gpt-4o'

export interface ModelAttempt {
  provider: string
  model: LanguageModel
}

export const hasAIKeys = ANTHROPIC_KEYS.length > 0 || OPENAI_KEYS.length > 0

function anthropicModels(model: string): LanguageModel[] {
  return ANTHROPIC_KEYS.map((apiKey) => createAnthropic({ apiKey })(model))
}

function openaiModels(model: string): LanguageModel[] {
  return OPENAI_KEYS.map((apiKey) => createOpenAI({ apiKey })(model))
}

/**
 * Interleave the two providers so a provider-wide outage is handled fast:
 * Claude → GPT-4o → Claude(backup) → GPT-4o(backup) → ...
 */
function interleave(
  primary: { name: string; models: LanguageModel[] },
  secondary: { name: string; models: LanguageModel[] },
): ModelAttempt[] {
  const attempts: ModelAttempt[] = []
  const rounds = Math.max(primary.models.length, secondary.models.length)
  for (let r = 0; r < rounds; r++) {
    if (primary.models[r]) {
      attempts.push({
        provider: r === 0 ? primary.name : `${primary.name} (backup ${r})`,
        model: primary.models[r],
      })
    }
    if (secondary.models[r]) {
      attempts.push({
        provider: r === 0 ? secondary.name : `${secondary.name} (backup ${r})`,
        model: secondary.models[r],
      })
    }
  }
  return attempts
}

/** Text/structured generation chain. Claude leads, GPT-4o backs it up. */
export function textModelChain(): ModelAttempt[] {
  return interleave(
    { name: 'Claude Sonnet 4.5', models: anthropicModels(ANTHROPIC_MODEL) },
    { name: 'GPT-4o', models: openaiModels(OPENAI_MODEL) },
  )
}

/** Vision chain for reading uploaded score reports. GPT-4o leads here. */
export function visionModelChain(): ModelAttempt[] {
  return interleave(
    { name: 'GPT-4o', models: openaiModels(OPENAI_MODEL) },
    { name: 'Claude Sonnet 4.5', models: anthropicModels(ANTHROPIC_MODEL) },
  )
}
