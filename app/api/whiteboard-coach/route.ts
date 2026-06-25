import { openai } from '@ai-sdk/openai'
import { streamText, generateText, Output } from 'ai'
import { z } from 'zod'
import { PERSONAS, type PersonaKey } from '@/components/sat/whiteboard/lesson-data'

// Never use the edge runtime with the AI SDK.
export const maxDuration = 30

type Mode =
  | 'hint'
  | 'why'
  | 'practice'
  | 'check'
  | 'narrate'
  | 'solve'
  | 'summarize'
  | 'review'
  | 'explore'

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
  // review (vision)
  imageDataUrl?: string
  // explore (vision + structured): the current worked solution for grounding
  currentSolution?: string
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

// Shared shape for a step-by-step worked solution with one chosen visual.
// Used by both "solve" (work a typed question) and "explore" (break down a
// region the student marked on the board). Kept as a factory so each mode can
// extend it with its own extra fields.
const solveShape = {
  title: z.string().describe('Short topic label for the lesson.'),
  subject: z.string().describe('SAT section, e.g. "Math — Algebra".'),
  visual: z
    .enum(['geometry', 'graph', 'annotation', 'none'])
    .describe('Which single visual best fits this question.'),
  steps: z
    .array(
      z.object({
        board: z.string().describe('Concise text to write on the whiteboard.'),
        say: z.string().describe('One spoken narration sentence for this step.'),
      }),
    )
    .describe('Ordered solution steps.'),
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
    .describe('GEOMETRY elements (only when visual="geometry"), else [].'),
  graph: z
    .object({
      xMin: z.number(),
      xMax: z.number(),
      yMin: z.number(),
      yMax: z.number(),
      items: z.array(
        z.object({
          kind: z.enum(['line', 'curve', 'point', 'segment']),
          label: z.string().nullable(),
          m: z.number().nullable(),
          b: z.number().nullable(),
          expr: z.string().nullable(),
          px: z.number().nullable(),
          py: z.number().nullable(),
          x1: z.number().nullable(),
          y1: z.number().nullable(),
          x2: z.number().nullable(),
          y2: z.number().nullable(),
          revealAt: z.number(),
        }),
      ),
    })
    .nullable()
    .describe('COORDINATE-PLANE graph (only when visual="graph"), else null.'),
  annotation: z
    .object({
      text: z.string().describe('The sentence/passage shown on the board.'),
      marks: z.array(
        z.object({
          phrase: z.string().describe('Exact substring of text to mark.'),
          type: z.enum(['underline', 'circle', 'highlight', 'strike', 'box']),
          note: z.string().nullable(),
          revealAt: z.number(),
        }),
      ),
    })
    .nullable()
    .describe('ENGLISH annotation (only when visual="annotation"), else null.'),
  answer: z.string().describe('The final answer, concise.'),
} as const

// Shared rules describing how to fill the visual fields (kept in sync with the
// renderer in ai-solution.tsx). Reused by "solve" and "explore".
const VISUAL_RULES = `CHOOSE EXACTLY ONE VISUAL via "visual" and fill ONLY that visual's field. The whiteboard DRAWS it next to your steps, so pick the most helpful representation:

1) "visual":"geometry" — for shapes: triangle, square, rectangle, pentagon, hexagon, circle, semicircle, rhombus, parallelogram, trapezoid, polygons, angles. Fill "diagram". REQUIRED even for simple area/perimeter questions (e.g. area of a circle MUST draw a circle + labeled radius). Coordinates are a 0..100 space (0,0 = top-left). Center the figure within x:15..85, y:15..85, proportional. For regular polygons place vertices evenly around a center. Label key vertices and given measurements.
   diagram element kinds:
   - "polygon": closed shape — "points" = vertices in order.
   - "line": one segment — "points" = exactly 2 endpoints.
   - "circle": set "cx","cy","r".
   - "point": labeled vertex/dot — "x","y","text" (e.g. "A").
   - "label": floating text (side length / angle) — "x","y","text" (e.g. "6", "x°").
   - "rightangle": small right-angle marker — "x","y" at the corner.

2) "visual":"graph" — for anything on the COORDINATE PLANE: graphing lines (y = mx + b), parabolas/quadratics, plotting points, slope, intercepts, systems of equations, transformations. Fill "graph". This draws real x/y axes with a grid, so give MATH coordinates (not screen coords).
   graph fields:
   - "xMin","xMax","yMin","yMax": the visible window (e.g. -10..10). Choose a window that frames the key features (intercepts, vertex, points).
   - "items": array of things to plot. Each item: "kind" one of "line" | "curve" | "point" | "segment"; "label" (e.g. "y = 2x + 1"); "revealAt" (0-based step index).
     • "line": an infinite straight line — give "m" (slope) and "b" (y-intercept). 
     • "curve": a function plotted across the window — give "expr" as a JS-evaluable expression in x using Math (e.g. "x*x - 2*x - 3", "Math.sin(x)"). 
     • "point": a single point — give "px","py" and usually a "label" like "(2, 5)".
     • "segment": a finite segment — give "x1","y1","x2","y2".

3) "visual":"annotation" — for READING & WRITING / grammar / English questions where the key skill is ANALYZING a sentence or short passage. Fill "annotation". The board shows the actual text and visually marks it up as you teach.
   annotation fields:
   - "text": the exact sentence(s) / short passage to display on the board (keep under ~240 chars).
   - "marks": array of annotations over that text. Each mark: "phrase" (the EXACT substring from "text" to mark — must appear verbatim), "type" one of "underline" | "circle" | "highlight" | "strike" | "box", "note" (a short margin note explaining it, e.g. "subject"), "revealAt" (0-based step index).

4) "visual":"none" — only if no visual helps (rare). Leave all visual fields empty.`

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

${VISUAL_RULES}

Rules:
- Produce between 4 and 8 steps, in logical order, building to the answer.
- The FIRST step sets up the problem; the LAST step presents the final answer.
- Fill ONLY the field matching "visual"; leave the others empty ([] or null).
- "title": short topic label (e.g. "Graphing a Line", "Subject–Verb Agreement").
- "subject": SAT section (e.g. "Math — Algebra", "Reading & Writing").
- "answer": the final answer, concise.
- If the question is not a real/solvable SAT-style question, still give helpful steps and set "visual":"none".`,
      prompt: `Work through this SAT question step by step for the whiteboard:\n\n"${studentPrompt}"`,
      experimental_output: Output.object({
        schema: z.object(solveShape),
      }),
    })
    return Response.json(output)
  }

  if (mode === 'explore') {
    const img = body.imageDataUrl
    if (!img) return new Response('Missing image', { status: 400 })
    const current = (body.currentSolution ?? '').trim()
    const { output } = await generateText({
      model: openai('gpt-4o'),
      system: `${ROLE}${tone(persona)}

${qctx(question)}

You are shown an IMAGE that is a screenshot of the whiteboard. It contains the tutor's worked solution AND the student's own hand-drawn marks on top of it (a circle, ellipse, underline, highlight, or arrow) calling out ONE specific region they want explained. ${current ? `For reference, the work already on the board is:\n${current}\n` : ''}

Do the following:
1) Look carefully at WHERE the student marked and WHAT is under/near that mark (a specific term, number, equation, step, shape, or word).
2) Identify the single sub-point they are asking about.
3) Teach JUST that sub-point as a short, fresh step-by-step breakdown that will be DRAWN OFF TO THE SIDE on a clean part of the whiteboard — do NOT re-solve the whole problem.

For each step provide:
- "board": the short thing to WRITE on the whiteboard — a key equation, substitution, or label. Very concise, plain characters, ^ for exponents. NO markdown asterisks.
- "say": ONE spoken sentence (TTS) — spell math naturally, NO markdown.

${VISUAL_RULES}

Also provide:
- "focus": a SHORT label (3-6 words) naming exactly what the student marked, e.g. "Why 6² + 8² = c²" or "The word 'their'".
- "intro": ONE warm spoken sentence opening the breakdown, e.g. "Good question — let's zoom in on why we square both legs."

Rules:
- Produce between 3 and 6 focused steps. Keep it tight — this is a sub-explanation, not a full lesson.
- Pick the single MOST helpful visual for THIS sub-point (often "none" or a tiny diagram). Fill ONLY the field matching "visual".
- If the board looks essentially blank or you cannot tell what was marked, set "focus" to "your marked area", "visual":"none", and give 3 steps gently asking them to circle a specific part, then explaining the overall idea.
- "title": short topic label for the breakdown. "subject": SAT section. "answer": the key takeaway of this sub-point, concise.`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Here is my whiteboard. Break down the part I marked.',
            },
            { type: 'image', image: img },
          ],
        },
      ],
      experimental_output: Output.object({
        schema: z.object({
          ...solveShape,
          focus: z.string().describe('Short label of what the student marked.'),
          intro: z.string().describe('One spoken sentence opening the breakdown.'),
        }),
      }),
    })
    return Response.json(output)
  }

  if (mode === 'review') {
    const img = body.imageDataUrl
    if (!img) return new Response('Missing image', { status: 400 })
    const result = streamText({
      model: openai('gpt-4o'),
      system: `${ROLE}${tone(persona)}

${qctx(question)}

The student has drawn/written their own work on the whiteboard and tapped "Check my work". You are shown an IMAGE of their whiteboard. Look carefully at what they actually drew or wrote — shapes, numbers, equations, labels, graphs, arrows, handwriting.

Then talk through it like a tutor leaning over their shoulder:
1) Briefly say what you SEE they did (be specific to the drawing — reference their actual marks/numbers).
2) Point out what's correct and give credit.
3) Gently flag any mistake or missing step, and nudge them toward the fix WITHOUT just handing over the full answer unless they're basically done.
Keep it warm and concise: 2-4 sentences. If the board looks essentially blank, say you don't see any work yet and invite them to draw their attempt. Use **bold** for key terms.`,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Here is my whiteboard. Can you check my work?' },
            { type: 'image', image: img },
          ],
        },
      ],
    })
    return result.toTextStreamResponse()
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
