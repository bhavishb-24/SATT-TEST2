import type { PlanTopic } from './sat-types'
import type { GraphData } from '@/components/sat/lesson-graph'

// A fully deterministic (no-AI) lesson engine. Every topic (section) is mapped
// by keyword to FOUR interactive "learning targets". Each target pairs a short
// learning tip with a hands-on challenge. Challenge types vary to keep things
// fun and Duolingo-like:
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

export interface LearningTarget {
  title: string
  tip: string
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

function dataAnalysisLesson(): TopicLesson {
  return {
    targets: [
      {
        title: 'Read the labels first',
        tip: 'Before any math, read the title and both axis labels. Most data questions test careful reading, not hard arithmetic.',
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
        challenge: {
          kind: 'fill-blank',
          prompt: 'Pick the word that correctly completes the sentence.',
          template: 'Because it rained ___ the game was canceled.',
          options: [', (comma)', '; (semicolon)', 'nothing', ': (colon)'],
          correct: ', (comma)',
          explanation: 'A dependent clause ("Because it rained") is separated from the main clause by a comma.',
        },
      },
      {
        title: 'Order: build a correct sentence',
        tip: 'A clear sentence often runs: opener → main subject + verb → detail. Sequence the parts.',
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

function readingEvidenceLesson(): TopicLesson {
  return {
    targets: [
      {
        title: 'Find the proof line',
        tip: 'The right answer is always backed by a specific line. Highlight the exact sentence that proves it instead of trusting your gut.',
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
        tip: 'Strong evidence often contains signal words — "now used," "first," "because," or strong opinion words. Highlight the line that signals impact.',
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
        challenge: {
          kind: 'mc',
          prompt: 'Which statement best captures the main idea of the passage?',
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
        challenge: {
          kind: 'mc',
          prompt: 'Based on the passage, what can you reasonably infer about Lin’s sensors?',
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
