import type { PlanTopic } from './sat-types'
import type { GraphData } from '@/components/sat/lesson-graph'

// A fully deterministic (no-AI) lesson engine. Every topic (section) is mapped
// by keyword to FOUR interactive "learning targets". Each target is a complete
// mini-lesson that runs:
//   1. a short learning TIP,
//   2. a worked EXAMPLE that explains how to solve this question type on the SAT,
//   3. a hands-on PRACTICE challenge.
// Challenge types vary to keep things fun and Duolingo-like:
//   - 'mc'         multiple choice (optionally with a graph)
//   - 'highlight'  drag-to-select the evidence sentence (no AI grading)
//   - 'order'      tap the steps into the correct sequence
//   - 'fill-blank' tap a word chip to fill the blank
// Finishing all four targets completes the topic and unlocks the next one.

export type ChallengeKind = 'mc' | 'highlight' | 'order' | 'fill-blank'

export interface MultipleChoiceChallenge {
  kind: 'mc'
  prompt: string
  graph?: GraphData
  choices: string[]
  correctIndex: number
  explanation: string
}

export interface HighlightChallenge {
  kind: 'highlight'
  prompt: string
  passage: string
  // Acceptable sentence(s); a selection that substantially overlaps counts.
  answers: string[]
  explanation: string
}

export interface OrderChallenge {
  kind: 'order'
  prompt: string
  // Items listed in the CORRECT order; the UI presents them shuffled.
  items: string[]
  explanation: string
}

export interface FillBlankChallenge {
  kind: 'fill-blank'
  prompt: string
  // The sentence with the blank written as "___".
  template: string
  options: string[]
  correct: string
  explanation: string
}

export type Challenge =
  | MultipleChoiceChallenge
  | HighlightChallenge
  | OrderChallenge
  | FillBlankChallenge

// A worked example shown before the practice question. It demonstrates the
// method on a concrete problem and ends with an SAT-specific strategy tip.
export interface TargetExample {
  // The example problem or scenario.
  problem: string
  // Optional supporting visual.
  graph?: GraphData
  // Step-by-step worked solution.
  steps: string[]
  // One-line "how to handle this on the SAT" takeaway.
  satStrategy: string
}

export interface LearningTarget {
  title: string
  tip: string
  example: TargetExample
  challenge: Challenge
}

export interface TopicLesson {
  targets: LearningTarget[]
}

// ---------------------------------------------------------------------------
// Math — Linear equations & algebra
// ---------------------------------------------------------------------------

function linearAlgebraLesson(): TopicLesson {
  return {
    targets: [
      {
        title: 'Isolate the variable',
        tip: 'To solve a linear equation, undo addition/subtraction first, then undo multiplication/division. Whatever you do to one side, do to the other.',
        example: {
          problem: 'Worked example: solve 2x − 3 = 7.',
          steps: [
            'Add 3 to both sides to undo the −3:  2x = 10.',
            'Divide both sides by 2 to undo the ×2:  x = 5.',
            'Check: 2(5) − 3 = 10 − 3 = 7. ✓',
          ],
          satStrategy:
            'On the SAT, work backwards through the order of operations — undo +/− before ×/÷ — and always plug your answer back in to confirm.',
        },
        challenge: {
          kind: 'mc',
          prompt: 'If 3x + 4 = 19, what is the value of x?',
          choices: ['3', '5', '7', '15'],
          correctIndex: 1,
          explanation: 'Subtract 4 from both sides: 3x = 15. Divide by 3: x = 5.',
        },
      },
      {
        title: 'Read slope & intercept',
        tip: 'In y = mx + b, m is the slope (steepness) and b is the y-intercept (where the line crosses the y-axis).',
        example: {
          problem: 'Worked example: identify the slope and intercept of y = −2x + 4.',
          graph: {
            kind: 'line',
            slope: -2,
            intercept: 4,
            xMin: -1,
            xMax: 4,
            yMin: -4,
            yMax: 8,
            points: [{ x: 0, y: 4, label: '(0, 4)' }],
          },
          steps: [
            'Match to y = mx + b:  m = −2 and b = 4.',
            'The slope is −2, so the line falls 2 units for every 1 unit right.',
            'The y-intercept is 4 — the line crosses the y-axis at (0, 4).',
          ],
          satStrategy:
            'The SAT loves "what is the slope/intercept" questions. Just rewrite the line in y = mx + b form and read off the numbers — no graphing needed.',
        },
        challenge: {
          kind: 'mc',
          prompt: 'What is the slope of the line shown below, y = 3x − 2?',
          graph: {
            kind: 'line',
            slope: 3,
            intercept: -2,
            xMin: -2,
            xMax: 4,
            yMin: -6,
            yMax: 10,
            points: [{ x: 0, y: -2, label: '(0, -2)' }],
          },
          choices: ['3', '−2', '1/3', '2'],
          correctIndex: 0,
          explanation: 'The slope is the coefficient of x, which is 3. The −2 is the y-intercept.',
        },
      },
      {
        title: 'Order the solving steps',
        tip: 'Solving 2x + 5 = 17 has a clear order: deal with the +5 before the ×2. Put the steps in sequence.',
        example: {
          problem: 'Worked example: solve 5x + 2 = 22 step by step.',
          steps: [
            'Start: 5x + 2 = 22.',
            'Subtract 2 from both sides → 5x = 20.',
            'Divide both sides by 5 → x = 4.',
          ],
          satStrategy:
            'Sequence matters: on the SAT, isolate the variable term first (move constants away), then divide off the coefficient last.',
        },
        challenge: {
          kind: 'order',
          prompt: 'Tap the steps in the correct order to solve 2x + 5 = 17.',
          items: [
            'Start: 2x + 5 = 17',
            'Subtract 5 from both sides → 2x = 12',
            'Divide both sides by 2 → x = 6',
          ],
          explanation: 'Undo the +5 first (subtract 5), then undo the ×2 (divide by 2). x = 6.',
        },
      },
      {
        title: 'Translate words to math',
        tip: '"is" becomes =, "more than" becomes +, "twice" becomes 2×. Build the equation piece by piece.',
        example: {
          problem: 'Worked example: "3 less than four times a number is 9." Write the equation.',
          steps: [
            '"four times a number" → 4x.',
            '"3 less than 4x" → 4x − 3.',
            '"is 9" → = 9.  Final equation: 4x − 3 = 9.',
          ],
          satStrategy:
            'Translate word problems left-to-right, one phrase at a time. Watch the order of "less than" — it flips: "3 less than 4x" is 4x − 3, not 3 − 4x.',
        },
        challenge: {
          kind: 'fill-blank',
          prompt: 'Complete the equation for: "5 more than twice a number is 17."',
          template: '2x + 5 = ___',
          options: ['17', '5', '2', '12'],
          correct: '17',
          explanation: '"is 17" means the expression equals 17, so 2x + 5 = 17.',
        },
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Math — Data analysis / charts
// ---------------------------------------------------------------------------

const SALES_BARS: GraphData = {
  kind: 'bar',
  yLabel: 'Units sold',
  bars: [
    { label: 'Jan', value: 25 },
    { label: 'Feb', value: 30 },
    { label: 'Mar', value: 40 },
    { label: 'Apr', value: 35 },
  ],
}

const TEMP_BARS: GraphData = {
  kind: 'bar',
  yLabel: 'High °F',
  bars: [
    { label: 'Mon', value: 60 },
    { label: 'Tue', value: 68 },
    { label: 'Wed', value: 72 },
  ],
}

function dataAnalysisLesson(): TopicLesson {
  return {
    targets: [
      {
        title: 'Read the labels first',
        tip: 'Before any math, read the title and both axis labels. Most data questions test careful reading, not hard arithmetic.',
        example: {
          problem: 'Worked example: what does the height of each bar show in this temperature chart?',
          graph: TEMP_BARS,
          steps: [
            'Read the y-axis label: "High °F".',
            'Read the x-axis labels: the days Mon, Tue, Wed.',
            'So each bar’s height = the daily high temperature in °F.',
          ],
          satStrategy:
            'On the SAT, glance at the axis labels before reading the answer choices — half the wrong answers describe the wrong axis.',
        },
        challenge: {
          kind: 'mc',
          prompt: 'In the chart below, what does the height of each bar represent?',
          graph: SALES_BARS,
          choices: ['The month', 'Units sold', 'The price', 'The store name'],
          correctIndex: 1,
          explanation: 'The y-axis is labeled "Units sold", so each bar’s height shows units sold that month.',
        },
      },
      {
        title: 'Compare two bars',
        tip: 'To compare two values, read each off the axis and subtract — do not eyeball it.',
        example: {
          problem: 'Worked example: how much warmer was Wednesday than Monday?',
          graph: TEMP_BARS,
          steps: [
            'Read Wednesday’s bar: 72 °F.',
            'Read Monday’s bar: 60 °F.',
            'Subtract: 72 − 60 = 12 °F warmer.',
          ],
          satStrategy:
            '"How many more/fewer" always means subtract. Read both exact values off the axis, then take the difference.',
        },
        challenge: {
          kind: 'mc',
          prompt: 'How many more units were sold in March than in February?',
          graph: SALES_BARS,
          choices: ['5', '10', '15', '40'],
          correctIndex: 1,
          explanation: 'March = 40, February = 30. 40 − 30 = 10.',
        },
      },
      {
        title: 'Spot the trend',
        tip: 'A trend is the overall direction. Check whether values mostly rise, fall, or stay flat across the categories.',
        example: {
          problem: 'Worked example: describe the temperature trend Mon → Wed.',
          graph: TEMP_BARS,
          steps: [
            'List the values: 60 → 68 → 72.',
            'Each day is higher than the one before.',
            'So the trend is steadily increasing.',
          ],
          satStrategy:
            'For "which best describes" trend questions, scan left to right: is it going up, down, or flat? Match that one word to the answer.',
        },
        challenge: {
          kind: 'mc',
          prompt: 'Which best describes sales from January to March?',
          graph: SALES_BARS,
          choices: ['Steadily increasing', 'Steadily decreasing', 'Flat', 'Increasing then dropping to zero'],
          correctIndex: 0,
          explanation: 'Jan 25 → Feb 30 → Mar 40 rises each month, so sales steadily increase over that span.',
        },
      },
      {
        title: 'Order: how to read a chart',
        tip: 'There is a reliable routine for every data question. Put the steps in order.',
        example: {
          problem: 'Worked example: the routine for "how many more units sold in Mar than Jan?"',
          graph: SALES_BARS,
          steps: [
            'First read the title and axis labels (months vs. units sold).',
            'Then find the two bars asked about: Mar (40) and Jan (25).',
            'Finally do the math: 40 − 25 = 15.',
          ],
          satStrategy:
            'Every chart question follows the same order — orient (labels), locate (the data points), then calculate. Never skip straight to the math.',
        },
        challenge: {
          kind: 'order',
          prompt: 'Tap the steps in the order you should read any chart.',
          items: [
            'Read the title and axis labels',
            'Find the specific bars or points the question asks about',
            'Do the math (subtract, compare, or add)',
          ],
          explanation: 'Always orient yourself with labels first, locate the data, then calculate.',
        },
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Reading & Writing — Grammar / sentence structure
// ---------------------------------------------------------------------------

function grammarLesson(): TopicLesson {
  return {
    targets: [
      {
        title: 'Comma before FANBOYS',
        tip: 'When you join two complete sentences with for, and, nor, but, or, yet, so, put a comma before the conjunction.',
        example: {
          problem: 'Worked example: combine "I studied hard" and "I passed the test."',
          steps: [
            'Both parts are complete sentences (each has a subject + verb).',
            'Choose a FANBOYS conjunction to join them: "and".',
            'Put a comma before it → "I studied hard, and I passed the test."',
          ],
          satStrategy:
            'On the SAT, test each half: if both sides can stand alone, a FANBOYS join needs a comma before the conjunction.',
        },
        challenge: {
          kind: 'mc',
          prompt: 'Which version is punctuated correctly?',
          choices: [
            'The bus was late, so we missed the opening.',
            'The bus was late so, we missed the opening.',
            'The bus was late we missed the opening.',
            'The bus, was late so we missed the opening.',
          ],
          correctIndex: 0,
          explanation: 'Two complete sentences joined by "so" need the comma before "so".',
        },
      },
      {
        title: 'Spot the run-on',
        tip: 'A run-on jams two complete sentences together with no punctuation. Read each half — can it stand alone?',
        example: {
          problem: 'Worked example: is "The rain stopped we went outside" correct?',
          steps: [
            '"The rain stopped" is a complete sentence.',
            '"we went outside" is also a complete sentence.',
            'Two complete sentences with nothing between them = a run-on. Fix it with a period, semicolon, or comma + FANBOYS.',
          ],
          satStrategy:
            'When two complete thoughts collide with no punctuation, it is a run-on. The SAT fix is usually a period or a comma + and/but/so.',
        },
        challenge: {
          kind: 'mc',
          prompt: 'Which sentence is a run-on that needs fixing?',
          choices: [
            'Maria studied all night she still felt nervous.',
            'Maria studied all night, but she still felt nervous.',
            'Although Maria studied all night, she felt nervous.',
            'Maria studied all night and felt nervous.',
          ],
          correctIndex: 0,
          explanation: '"Maria studied all night" and "she still felt nervous" are both complete sentences with nothing joining them — a run-on.',
        },
      },
      {
        title: 'Fix the sentence',
        tip: 'A dependent opener (Because…, Although…, When…) is followed by a comma before the main clause.',
        example: {
          problem: 'Worked example: punctuate "When the bell rang ___ the students left."',
          steps: [
            '"When the bell rang" is a dependent clause — it cannot stand alone.',
            'It opens the sentence, so it is followed by a comma.',
            'Result: "When the bell rang, the students left."',
          ],
          satStrategy:
            'If a sentence starts with Because/Although/When/If, expect a comma right before the main clause begins.',
        },
        challenge: {
          kind: 'fill-blank',
          prompt: 'Pick the punctuation that correctly completes the sentence.',
          template: 'Because it rained ___ the game was canceled.',
          options: [', (comma)', '; (semicolon)', 'nothing', ': (colon)'],
          correct: ', (comma)',
          explanation: 'A dependent clause ("Because it rained") is separated from the main clause by a comma.',
        },
      },
      {
        title: 'Order: build a correct sentence',
        tip: 'A clear sentence often runs: opener → main subject + verb → detail. Sequence the parts.',
        example: {
          problem: 'Worked example: order the parts "and rested." / "After the long flight," / "the team checked in"',
          steps: [
            'The introductory phrase comes first: "After the long flight,".',
            'Then the main clause (subject + verb): "the team checked in".',
            'Then the added detail: "and rested." → "After the long flight, the team checked in and rested."',
          ],
          satStrategy:
            'The SAT rewards the natural order: introductory phrase (with comma), then the main subject-verb, then extra detail.',
        },
        challenge: {
          kind: 'order',
          prompt: 'Tap the parts in order to build a correct sentence.',
          items: [
            'After the long flight,',
            'the team checked into the hotel',
            'and rested before the match.',
          ],
          explanation: 'The introductory phrase comes first (with its comma), then the main clause, then the added detail.',
        },
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Reading & Writing — Reading comprehension / evidence
// ---------------------------------------------------------------------------

const REEF_PASSAGE =
  'Dr. Amina Lin spent two decades studying coral reefs in the South Pacific. Early in her career, most researchers measured reef health by counting fish from boats. Lin instead built low-cost underwater sensors that recorded temperature and acidity every hour, a method now used by reef labs around the world. Critics first doubted the tiny devices would survive storms. Today she mentors students from a dozen countries.'

const GARDEN_PASSAGE =
  'When the city paved over its last empty lot, neighbors worried the block had lost its only green space. Then Mr. Okafor proposed a rooftop garden above the old library. Volunteers hauled soil up five flights of stairs every weekend. Within a year, the rooftop produced enough vegetables to stock a small food pantry. The project has since inspired three nearby buildings to start gardens of their own.'

function readingEvidenceLesson(): TopicLesson {
  return {
    targets: [
      {
        title: 'Find the proof line',
        tip: 'The right answer is always backed by a specific line. Highlight the exact sentence that proves it instead of trusting your gut.',
        example: {
          problem:
            'Worked example: which line proves Mr. Okafor’s garden helped the community? Passage: "…Within a year, the rooftop produced enough vegetables to stock a small food pantry…"',
          steps: [
            'Restate the claim: the garden helped the community.',
            'Scan for a line that directly shows a community benefit.',
            '"produced enough vegetables to stock a small food pantry" is concrete proof — pick the line, don’t paraphrase.',
          ],
          satStrategy:
            'For "which choice best supports" questions, the answer must contain literal proof. Find the sentence first, then match it to a choice.',
        },
        challenge: {
          kind: 'highlight',
          prompt:
            'Highlight the sentence that best supports the idea that Dr. Lin’s work changed how scientists study reefs. Drag to select, then press Check.',
          passage: REEF_PASSAGE,
          answers: [
            'Lin instead built low-cost underwater sensors that recorded temperature and acidity every hour, a method now used by reef labs around the world.',
          ],
          explanation:
            'This sentence states her method is "now used by reef labs around the world" — direct evidence her work changed the field.',
        },
      },
      {
        title: 'Identify key words',
        tip: 'Strong evidence often contains signal words — "now used," "first," "because," or strong opinion words. Highlight the line that signals the idea.',
        example: {
          problem:
            'Worked example: which line signals that the garden inspired others? Passage: "…has since inspired three nearby buildings to start gardens of their own."',
          steps: [
            'Underline signal words that show influence: "inspired".',
            'That word links the project to a result for others.',
            'Highlight the whole sentence containing the signal word.',
          ],
          satStrategy:
            'Signal words (inspired, doubted, because, however) point straight at the evidence. Hunt for them instead of re-reading everything.',
        },
        challenge: {
          kind: 'highlight',
          prompt:
            'Highlight the sentence that shows others doubted Lin’s approach at first. Drag to select, then press Check.',
          passage: REEF_PASSAGE,
          answers: ['Critics first doubted the tiny devices would survive storms.'],
          explanation:
            'The word "Critics ... doubted" directly signals early skepticism about her devices.',
        },
      },
      {
        title: 'Main idea',
        tip: 'The main idea is what the whole passage is mostly about — not one small detail. Ask: who is this about, and what is the point?',
        example: {
          problem: 'Worked example: what is the main idea of the rooftop-garden passage?',
          graph: undefined,
          steps: [
            'Ask who/what it is about: a rooftop garden started by Mr. Okafor.',
            'Ask what the point is: it replaced lost green space and helped the community.',
            'Combine: "A resident’s rooftop garden restored green space and benefited the neighborhood." Avoid choices about one tiny detail.',
          ],
          satStrategy:
            'Right main-idea answers cover the whole passage. Eliminate choices that are true but only about a single sentence.',
        },
        challenge: {
          kind: 'mc',
          prompt: 'Which statement best captures the main idea of the reef passage?',
          choices: [
            'Dr. Lin pioneered a new, widely adopted way to monitor coral reefs.',
            'Coral reefs are found only in the South Pacific.',
            'Counting fish from boats is the best way to measure reef health.',
            'Storms always destroy underwater sensors.',
          ],
          correctIndex: 0,
          explanation: 'The passage centers on Lin’s sensor method and its wide adoption — that is the main idea.',
        },
      },
      {
        title: 'Inference from evidence',
        tip: 'An inference is a conclusion the text supports without stating outright. Stay close to the evidence — do not over-reach.',
        example: {
          problem: 'Worked example: what can you infer about the rooftop garden’s volunteers?',
          steps: [
            'Find the evidence: they "hauled soil up five flights of stairs every weekend".',
            'Stay close to the text — repeated hard work over time.',
            'Reasonable inference: the volunteers were dedicated. Avoid extremes like "they were paid" (not supported).',
          ],
          satStrategy:
            'A correct inference is one small, safe step beyond the text. If you need outside facts or a big leap, it is wrong on the SAT.',
        },
        challenge: {
          kind: 'mc',
          prompt: 'Based on the reef passage, what can you reasonably infer about Lin’s sensors?',
          choices: [
            'They proved more durable and useful than critics expected.',
            'They were abandoned after the first storm.',
            'They were more expensive than counting fish.',
            'They only work in the South Pacific.',
          ],
          correctIndex: 0,
          explanation: 'Critics doubted them, yet they are "now used ... around the world" — so they outperformed expectations.',
        },
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Generic fallbacks
// ---------------------------------------------------------------------------

function genericMathLesson(): TopicLesson {
  return {
    targets: [
      {
        title: 'Translate words into math',
        tip: 'Turn each phrase into a symbol: "is" → =, "more than" → +, "of" → ×. Build the equation, then solve.',
        example: {
          problem: 'Worked example: "4 more than three times a number is 19." Write the equation.',
          steps: [
            '"three times a number" → 3x.',
            '"4 more than 3x" → 3x + 4.',
            '"is 19" → = 19.  Equation: 3x + 4 = 19.',
          ],
          satStrategy:
            'Translate one phrase at a time, left to right. Convert the words to symbols before doing any arithmetic.',
        },
        challenge: {
          kind: 'mc',
          prompt: '"5 more than twice a number is 17." Which equation is correct?',
          choices: ['2x + 5 = 17', '5x + 2 = 17', '2x − 5 = 17', 'x + 5 = 17'],
          correctIndex: 0,
          explanation: 'Twice a number is 2x; 5 more is 2x + 5; "is 17" means = 17.',
        },
      },
      {
        title: 'Solve step by step',
        tip: 'Isolate the variable: undo addition first, then multiplication.',
        example: {
          problem: 'Worked example: solve 3x + 4 = 19.',
          steps: [
            'Subtract 4 from both sides → 3x = 15.',
            'Divide both sides by 3 → x = 5.',
            'Check: 3(5) + 4 = 19. ✓',
          ],
          satStrategy:
            'Undo constants before coefficients, and verify by plugging your answer back in — the SAT often lists tempting wrong values.',
        },
        challenge: {
          kind: 'mc',
          prompt: 'Solve 2x + 5 = 17. What is x?',
          choices: ['4', '6', '8', '11'],
          correctIndex: 1,
          explanation: '2x = 12, so x = 6.',
        },
      },
      {
        title: 'Order the steps',
        tip: 'Sequence matters when solving equations.',
        example: {
          problem: 'Worked example: solve 3x − 6 = 9 in order.',
          steps: [
            'Start: 3x − 6 = 9.',
            'Add 6 to both sides → 3x = 15.',
            'Divide by 3 → x = 5.',
          ],
          satStrategy:
            'Move the constant first, then divide off the coefficient. Doing it out of order causes most careless mistakes.',
        },
        challenge: {
          kind: 'order',
          prompt: 'Tap the steps in order to solve 4x − 3 = 9.',
          items: ['Start: 4x − 3 = 9', 'Add 3 to both sides → 4x = 12', 'Divide by 4 → x = 3'],
          explanation: 'Undo the −3 first, then the ×4. x = 3.',
        },
      },
      {
        title: 'Check your answer',
        tip: 'Plug your answer back in to confirm both sides match.',
        example: {
          problem: 'Worked example: verify x = 5 solves 3x + 4 = 19.',
          steps: [
            'Substitute x = 5 into the left side: 3(5) + 4.',
            'Simplify: 15 + 4 = 19.',
            '19 equals the right side, so x = 5 checks out. ✓',
          ],
          satStrategy:
            'When unsure, plug the answer choices back into the original equation — the one that makes both sides equal is correct.',
        },
        challenge: {
          kind: 'fill-blank',
          prompt: 'Check x = 3 in 4x − 3: 4(3) − 3 = ___',
          template: '4(3) − 3 = ___',
          options: ['9', '12', '6', '15'],
          correct: '9',
          explanation: '4 × 3 = 12, and 12 − 3 = 9, which matches the right side.',
        },
      },
    ],
  }
}

function genericReadingWritingLesson(): TopicLesson {
  // Reuse the grammar targets — they are broadly useful for any R&W topic.
  return grammarLesson()
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

export function getTopicLesson(topic: PlanTopic): TopicLesson {
  const name = topic.name.toLowerCase()
  const isMath = topic.section === 'Math'

  if (/linear|algebra|equation|slope|\bline\b|function|expression|inequalit/.test(name)) {
    return linearAlgebraLesson()
  }
  if (/data|graph|chart|statistic|table|percent|ratio|probab|scatter/.test(name)) {
    return dataAnalysisLesson()
  }
  if (/grammar|punctuation|comma|verb|sentence|clause|transition|boundar|modifier/.test(name)) {
    return grammarLesson()
  }
  if (/read|comprehension|evidence|keyword|key word|main idea|inference|vocabulary|context|passage|author|text/.test(name)) {
    return readingEvidenceLesson()
  }

  return isMath ? genericMathLesson() : genericReadingWritingLesson()
}

// Normalizes text for lenient highlight comparison.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Returns true if the user's selection substantially overlaps an accepted answer.
export function isHighlightCorrect(selection: string, answers: string[]): boolean {
  const sel = normalize(selection)
  if (sel.length < 8) return false
  return answers.some((ans) => {
    const a = normalize(ans)
    if (!a) return false
    if (sel.includes(a)) return true
    if (a.includes(sel) && sel.length >= a.length * 0.7) return true
    return false
  })
}
