import { openai } from '@ai-sdk/openai'
import { streamText, generateText, Output } from 'ai'
import { z } from 'zod'
import { PERSONAS, type PersonaKey } from '@/components/sat/whiteboard/lesson-data'

// Never use the edge runtime with the AI SDK.
export const maxDuration = 30

type Mode = 'hint' | 'why' | 'practice' | 'check' | 'narrate' | 'solve' | 'summarize'

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
  // solve
  prompt?: string
  // summarize
  title?: string
  answer?: string
  workedSteps?: string[]
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

  if (mode === 'solve') {
    const studentPrompt = (body.prompt ?? question?.prompt ?? '').trim()
    if (!studentPrompt) {
      return new Response('Missing question prompt', { status: 400 })
    }
    const { output } = await generateText({
      // Stronger model: reliably follows the "always draw the figure" instruction.
      model: openai('gpt-4o'),
      system: `${ROLE}${tone(persona)}

A student typed an SAT question they want worked through on the whiteboard. Solve it correctly, then break the solution into clear teaching steps that will be WRITTEN OUT on a whiteboard one at a time while you narrate.

For each step provide:
- "board": the short thing to WRITE on the whiteboard for this step — a key equation, substitution, or label. Keep it very concise (a formula or a few words / numbers), like real handwritten board work. Use plain characters and ^ for exponents (e.g. "6^2 + 8^2 = c^2"). NO markdown asterisks here.
- "say": ONE sentence the tutor speaks aloud as that line appears. Write for the ear (spoken via TTS) — spell math naturally (e.g. "six squared plus eight squared"). NO markdown.

DIAGRAM (CRITICAL — do not skip):
Decide if the question involves ANY geometric figure or shape — triangle, square, rectangle, pentagon, hexagon, circle, semicircle, rhombus, parallelogram, trapezoid, polygon, coordinate graph/line, or angles. If it does, you MUST return a non-empty "diagram" that visually draws the figure. This is REQUIRED even for simple questions like perimeter or area — e.g. an area-of-a-circle question MUST include a circle element (and ideally a labeled radius line); a pentagon perimeter question MUST include a 5-sided polygon. A geometry question with an empty diagram is a FAILURE. ALWAYS label the shape's key vertices/points and the given measurements.
The diagram is a list of elements positioned in a 0..100 coordinate space (0,0 = top-left, 100,100 = bottom-right). Keep the figure centered, roughly within x:15..85 and y:15..85, and proportional. For regular polygons, place the vertices evenly around a center so the shape looks correct.
Element kinds:
- "polygon": a closed shape — set "points" to its vertices in order (e.g. a pentagon has 5 points). Use for triangles, squares, pentagons, rhombuses, any straight-edged shape.
- "line": a single segment — set "points" to exactly 2 points. Use for radii, diagonals, heights, axes.
- "circle": set "cx","cy","r". Use for circles.
- "point": a labeled vertex/dot — set "x","y" and "text" (e.g. "A").
- "label": floating text like a side length or angle — set "x","y","text" (e.g. "6", "8", "x°").
- "rightangle": a small right-angle square marker — set "x","y" at the corner.
Set "revealAt" to the step index (0-based) at which that element should appear, so the figure builds up alongside the steps. For non-geometry questions, return an EMPTY diagram array.

Rules:
- Produce between 4 and 8 steps, in logical order, building to the answer.
- The FIRST step should restate/set up the problem; the LAST step should present the final answer.
- "title" is a short topic label (e.g. "Pythagorean Theorem", "Area of a Pentagon").
- "subject" is the SAT section (e.g. "Math — Geometry", "Reading & Writing").
- "answer" is the final answer, concise.
- If the question is not a real/solvable SAT-style question, still respond with a short, helpful set of steps explaining what's needed, and an empty diagram.`,
      prompt: `Work through this SAT question step by step for the whiteboard:\n\n"${studentPrompt}"`,
      experimental_output: Output.object({
        schema: z.object({
          title: z.string().describe('Short topic label for the lesson.'),
          subject: z.string().describe('SAT section, e.g. "Math — Algebra".'),
          steps: z
            .array(
              z.object({
                board: z.string().describe('Concise text to write on the whiteboard.'),
                say: z.string().describe('One spoken narration sentence for this step.'),
              }),
            )
            .describe('4 to 8 ordered solution steps.'),
          diagram: z
            .array(
              z.object({
                kind: z.enum(['polygon', 'line', 'circle', 'point', 'label', 'rightangle']),
                points: z
                  .array(z.object({ x: z.number(), y: z.number() }))
                  .describe('Vertices for polygon, or 2 endpoints for a line. Empty otherwise.'),
                cx: z.number().nullable(),
                cy: z.number().nullable(),
                r: z.number().nullable(),
                x: z.number().nullable(),
                y: z.number().nullable(),
                text: z.string().nullable(),
                revealAt: z.number().describe('0-based step index when this element appears.'),
              }),
            )
            .describe('Geometry elements to draw, or an empty array for non-geometry questions.'),
          answer: z.string().describe('The final answer, concise.'),
        }),
      }),
    })
    return Response.json(output)
  }

  if (mode === 'summarize') {
    const worked = (body.workedSteps ?? []).filter(Boolean)
    const { output } = await generateText({
      model,
      system: `${ROLE}${tone(persona)}

The student just finished a whiteboard lesson. Write a concise, ENCOURAGING lesson summary tailored to THIS specific question and the steps that were worked. Everything must be specific to the actual problem — never generic boilerplate.`,
      prompt: `Lesson topic: "${body.title ?? question?.section ?? 'SAT problem'}"
Question: "${question?.prompt ?? body.prompt ?? ''}"
Final answer: "${body.answer ?? ''}"
Steps worked on the board:
${worked.map((s, i) => `${i + 1}. ${s}`).join('\n') || '(not provided)'}

Produce a summary object specific to this lesson.`,
      experimental_output: Output.object({
        schema: z.object({
          title: z.string().describe('Short topic label, e.g. "Area of a Pentagon".'),
          subject: z.string().describe('SAT section, e.g. "Math — Geometry".'),
          confidence: z
            .number()
            .describe('Estimated post-lesson confidence 0-100 (usually 80-95 after finishing).'),
          conceptsLearned: z
            .array(z.string())
            .describe('2-4 concepts this specific lesson taught.'),
          mistakesCorrected: z
            .array(z.string())
            .describe('1-3 common mistakes to avoid for THIS problem type.'),
          nextTopic: z.string().describe('A sensible next topic to study.'),
          homework: z
            .array(z.string())
            .describe('2-3 short practice questions similar to this one, with concrete numbers.'),
          flashcards: z.number().describe('How many flashcards were created (1-3).'),
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
