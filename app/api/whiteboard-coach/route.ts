import { openai } from '@ai-sdk/openai'
import { streamText, generateText, Output } from 'ai'
import { z } from 'zod'
import { PERSONAS, type PersonaKey } from '@/components/sat/whiteboard/lesson-data'

// Never use the edge runtime with the AI SDK.
export const maxDuration = 30

type Mode = 'hint' | 'why' | 'practice' | 'check' | 'narrate'

interface CoachRequest {
  mode: Mode
  persona?: PersonaKey
  question?: { number?: number; section?: string; prompt?: string }
  // hint
  hintLevel?: number
  totalHints?: number
  // why
  step?: string
  // check
  practicePrompt?: string
  expectedAnswer?: string
  studentAnswer?: string
  // narrate
  steps?: number
}

const ROLE = `You are Whiteboard AI, an SAT tutor inside a visual whiteboard app called SAT Sage. Write in plain language a high-schooler understands. Use **bold** (double asterisks) for key terms or formulas — the UI renders it.`

function tone(persona?: PersonaKey): string {
  const p = PERSONAS.find((x) => x.key === persona)
  return p ? `\n\nTONE & PERSONALITY: ${p.instruction}` : ''
}

function qctx(q?: CoachRequest['question']): string {
  return q?.prompt
    ? `The student is working on SAT Question ${q.number ?? ''} (${q.section ?? ''}): "${q.prompt}".`
    : 'The student is working through an SAT problem on the whiteboard.'
}

export async function POST(req: Request) {
  let body: CoachRequest
  try {
    body = (await req.json()) as CoachRequest
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  const { mode, persona, question } = body
  const model = openai('gpt-4o-mini')

  // --- Streaming text modes -------------------------------------------------
  if (mode === 'hint') {
    const level = Math.max(1, body.hintLevel ?? 1)
    const total = Math.max(level, body.totalHints ?? 4)
    const strength =
      level >= total
        ? 'This is the FINAL hint — walk through the key step almost completely, but still let the student state the final number themselves.'
        : level === 1
          ? 'This is the FIRST, gentlest hint — just nudge their attention to the right idea. Do NOT reveal the method yet.'
          : 'This is a MEDIUM hint — reveal a bit more of the method than before, building on earlier hints.'

    const result = streamText({
      model,
      system: `${ROLE}${tone(persona)}\n\n${qctx(question)}\n\nThe student pressed "Give me a hint". Give hint ${level} of ${total}. ${strength} Keep it to 1-2 sentences. Never state the final numeric answer.`,
      prompt: `Give hint number ${level}.`,
    })
    return result.toTextStreamResponse()
  }

  if (mode === 'why') {
    const result = streamText({
      model,
      system: `${ROLE}${tone(persona)}\n\n${qctx(question)}\n\nThe student tapped "Why?" on this step of the explanation. Explain WHY that step is true / why it works, conceptually, in 2-3 sentences. Focus on the reasoning, not just restating the step.`,
      prompt: `Explain why this step works: "${body.step ?? ''}"`,
    })
    return result.toTextStreamResponse()
  }

  // --- Structured JSON modes ------------------------------------------------
  if (mode === 'practice') {
    const { output } = await generateText({
      model,
      system: `${ROLE}${tone(persona)}\n\n${qctx(question)}\n\nGenerate ONE new practice problem that tests the SAME concept as the current question but with different numbers/context, at a similar SAT difficulty.`,
      prompt:
        'Create a fresh practice problem similar to the current one. Make it solvable with a clean answer.',
      experimental_output: Output.object({
        schema: z.object({
          prompt: z.string().describe('The full practice question text.'),
          section: z.string().describe('e.g. "Math — Geometry".'),
          answer: z.string().describe('The correct final answer, concise.'),
          explanation: z
            .string()
            .describe('A short worked explanation of how to reach the answer.'),
        }),
      }),
    })
    return Response.json(output)
  }

  if (mode === 'narrate') {
    const count = Math.max(3, Math.min(12, body.steps ?? 9))
    const { output } = await generateText({
      model,
      system: `${ROLE}${tone(persona)}\n\n${qctx(question)}\n\nYou are narrating a visual whiteboard lesson that draws the solution one step at a time. Produce exactly ${count} short spoken narration lines, in order, that walk the student from understanding the problem to the final answer. Each line is ONE sentence a tutor would say aloud as that part of the diagram/work appears. The lines should build progressively and the LAST line should reveal the final answer. Write for the ear (these are spoken via text-to-speech) — no markdown, no bullet symbols, spell out math naturally (e.g. "six squared plus eight squared").`,
      prompt: `Write the ${count} narration lines for this lesson.`,
      experimental_output: Output.object({
        schema: z.object({
          lines: z
            .array(z.string())
            .describe(`Exactly ${count} spoken narration lines, in teaching order.`),
        }),
      }),
    })
    return Response.json(output)
  }

  if (mode === 'check') {
    const { output } = await generateText({
      model,
      system: `${ROLE}${tone(persona)}\n\nYou are grading a student's answer to a practice problem and giving warm, specific feedback. Use **bold** for key terms.`,
      prompt: `Problem: "${body.practicePrompt ?? ''}"\nExpected answer: "${body.expectedAnswer ?? ''}"\nStudent's answer: "${body.studentAnswer ?? ''}"\n\nDecide if the student's answer is correct (allow equivalent forms). Then write 1-3 sentences of feedback: praise if right, or a gentle hint toward the fix if wrong (do not just give the answer unless they were close).`,
      experimental_output: Output.object({
        schema: z.object({
          correct: z.boolean(),
          feedback: z.string(),
        }),
      }),
    })
    return Response.json(output)
  }

  return new Response('Unknown mode', { status: 400 })
}
