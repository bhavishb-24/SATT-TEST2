import type { PlanTopic } from './sat-types'
import type { GraphData } from '@/components/sat/lesson-graph'

// A fully deterministic (no-AI) lesson engine. Every topic is mapped by keyword
// to a staged lesson: a learning Tip, a worked Example (optionally with a graph),
// and one interactive Practice question. Math topics that benefit from a sketch
// get a graph; reading/evidence topics use a highlight question with preset
// acceptable answers (no AI grading).

export type LessonQuestionType = 'multiple-choice' | 'highlight' | 'free-text'

export interface LessonTip {
  title: string
  body: string
}

export interface LessonExample {
  title: string
  body: string
  graph?: GraphData
}

export interface MultipleChoiceQuestion {
  type: 'multiple-choice'
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
  graph?: GraphData
}

export interface HighlightQuestion {
  type: 'highlight'
  prompt: string
  passage: string
  // Acceptable correct sentence(s); a selection that substantially overlaps
  // any of these counts as correct.
  answers: string[]
  explanation: string
}

export interface FreeTextQuestion {
  type: 'free-text'
  prompt: string
  modelAnswer: string
  explanation: string
}

export type LessonQuestion =
  | MultipleChoiceQuestion
  | HighlightQuestion
  | FreeTextQuestion

export interface TopicLesson {
  tip: LessonTip
  example: LessonExample
  question: LessonQuestion
}

// ---------------------------------------------------------------------------
// Concrete lessons
// ---------------------------------------------------------------------------

function linearAlgebraLesson(): TopicLesson {
  return {
    tip: {
      title: 'Isolate the variable',
      body: 'To solve a linear equation, undo addition and subtraction first, then undo multiplication and division. Whatever you do to one side, do to the other — the equation stays balanced.',
    },
    example: {
      title: 'Worked example: y = 2x + 1',
      body: 'A linear equation graphs as a straight line. The number in front of x is the slope (how steep), and the lone number is the y-intercept (where it crosses the y-axis). Here the slope is 2 and the line crosses the y-axis at (0, 1).',
      graph: {
        kind: 'line',
        slope: 2,
        intercept: 1,
        xMin: -2,
        xMax: 4,
        yMin: -3,
        yMax: 9,
        points: [{ x: 0, y: 1, label: '(0, 1)' }],
      },
    },
    question: {
      type: 'multiple-choice',
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
      explanation: 'In y = mx + b, the slope is m — the coefficient of x. Here that is 3. The −2 is the y-intercept, not the slope.',
    },
  }
}

function dataAnalysisLesson(): TopicLesson {
  return {
    tip: {
      title: 'Read the labels first',
      body: 'Before doing any math on a chart, read the title and both axis labels. Most data questions are testing whether you read the graph carefully — not whether you can do hard arithmetic.',
    },
    example: {
      title: 'Worked example: reading a bar chart',
      body: 'This chart shows units sold per month. To compare two months, read each bar’s value off the top, then subtract. March (40) minus January (25) is 15 more units.',
      graph: {
        kind: 'bar',
        yLabel: 'Units sold',
        bars: [
          { label: 'Jan', value: 25 },
          { label: 'Feb', value: 30 },
          { label: 'Mar', value: 40 },
          { label: 'Apr', value: 35 },
        ],
      },
    },
    question: {
      type: 'multiple-choice',
      prompt: 'Using the chart below, how many more units were sold in March than in February?',
      graph: {
        kind: 'bar',
        yLabel: 'Units sold',
        bars: [
          { label: 'Jan', value: 25 },
          { label: 'Feb', value: 30 },
          { label: 'Mar', value: 40 },
          { label: 'Apr', value: 35 },
        ],
      },
      choices: ['5', '10', '15', '40'],
      correctIndex: 1,
      explanation: 'March is 40 and February is 30. 40 − 30 = 10. Read each bar’s value first, then subtract.',
    },
  }
}

function grammarLesson(): TopicLesson {
  return {
    tip: {
      title: 'Comma before FANBOYS',
      body: 'When you join two complete sentences with a coordinating conjunction (for, and, nor, but, or, yet, so), put a comma before it. If one side is not a complete sentence, you usually do not need the comma.',
    },
    example: {
      title: 'Worked example',
      body: 'Incorrect: "Maria studied all night she still felt nervous." That is a run-on (two full sentences jammed together). Fixed: "Maria studied all night, but she still felt nervous." A comma + "but" correctly joins the two complete thoughts.',
    },
    question: {
      type: 'multiple-choice',
      prompt: 'Which version is punctuated correctly?',
      choices: [
        'The bus was late, so we missed the opening.',
        'The bus was late so, we missed the opening.',
        'The bus was late we missed the opening.',
        'The bus, was late so we missed the opening.',
      ],
      correctIndex: 0,
      explanation: 'Two complete sentences ("The bus was late" / "we missed the opening") are joined by "so", so the comma goes before "so".',
    },
  }
}

function readingEvidenceLesson(): TopicLesson {
  return {
    tip: {
      title: 'Find the proof line',
      body: 'The correct answer to a reading question is always supported by a specific line in the passage. Instead of going with your gut, find and highlight the exact sentence that proves the answer. The key words in that sentence are your evidence.',
    },
    example: {
      title: 'Worked example',
      body: 'If a question asks why the author admires the inventor, scan for the sentence that states a reason directly — usually one with a clear cause word like "because", "since", or a strong opinion word like "remarkable" or "tireless". That sentence is your evidence.',
    },
    question: {
      type: 'highlight',
      prompt:
        'Highlight the single sentence that best supports the idea that Dr. Lin’s work changed how scientists study coral reefs. Drag to select the sentence, then press Check.',
      passage:
        'Dr. Amina Lin spent two decades studying coral reefs in the South Pacific. Early in her career, most researchers measured reef health by counting fish from boats. Lin instead built low-cost underwater sensors that recorded temperature and acidity every hour, a method now used by reef labs around the world. Critics first doubted the tiny devices would survive storms. Today she mentors students from a dozen countries.',
      answers: [
        'Lin instead built low-cost underwater sensors that recorded temperature and acidity every hour, a method now used by reef labs around the world.',
      ],
      explanation:
        'This sentence directly states that her method is "now used by reef labs around the world" — that is the evidence her work changed how scientists study reefs. The other sentences give background or unrelated details.',
    },
  }
}

function genericMathLesson(): TopicLesson {
  return {
    tip: {
      title: 'Translate words into math',
      body: 'Turn each phrase into a symbol: "is" becomes =, "more than" becomes +, "of" often becomes ×. Build the equation piece by piece, then solve by isolating the variable.',
    },
    example: {
      title: 'Worked example',
      body: '"5 more than twice a number is 17." Twice a number is 2x, 5 more than that is 2x + 5, and "is 17" means = 17. So 2x + 5 = 17, which gives 2x = 12 and x = 6.',
    },
    question: {
      type: 'multiple-choice',
      prompt: 'If 3x + 4 = 19, what is the value of x?',
      choices: ['3', '5', '7', '15'],
      correctIndex: 1,
      explanation: 'Subtract 4 from both sides: 3x = 15. Divide both sides by 3: x = 5.',
    },
  }
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

  // Section-based fallback so every topic still gets a sensible lesson.
  return isMath ? genericMathLesson() : grammarLesson()
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
    // Correct if the selection contains the answer, or the selection covers
    // at least 70% of the answer's length (allowing a slightly loose drag).
    if (sel.includes(a)) return true
    if (a.includes(sel) && sel.length >= a.length * 0.7) return true
    return false
  })
}
