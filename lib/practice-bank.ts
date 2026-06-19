import type { PracticeQuestion, Section } from './sat-types'

// Deterministic fallback question bank used when the AI gateway is unavailable.
export const PRACTICE_BANK: PracticeQuestion[] = [
  {
    id: 'pb-m1',
    section: 'Math',
    topic: 'Linear equations',
    difficulty: 'Easy',
    prompt: 'If 3x + 5 = 20, what is the value of x?',
    choices: ['3', '5', '15', '45'],
    correctIndex: 1,
    explanation: 'Subtract 5 from both sides to get 3x = 15, then divide by 3 to get x = 5.',
  },
  {
    id: 'pb-m2',
    section: 'Math',
    topic: 'Slope',
    difficulty: 'Medium',
    prompt: 'What is the slope of the line passing through (2, 3) and (6, 11)?',
    choices: ['1/2', '2', '4', '8'],
    correctIndex: 1,
    explanation: 'Slope = (11 − 3) / (6 − 2) = 8 / 4 = 2.',
  },
  {
    id: 'pb-m3',
    section: 'Math',
    topic: 'Quadratics',
    difficulty: 'Medium',
    prompt: 'What are the solutions to x² − 5x + 6 = 0?',
    choices: ['x = 1, 6', 'x = 2, 3', 'x = −2, −3', 'x = 5, 6'],
    correctIndex: 1,
    explanation: 'Factor to (x − 2)(x − 3) = 0, so x = 2 or x = 3.',
  },
  {
    id: 'pb-m4',
    section: 'Math',
    topic: 'Geometry',
    difficulty: 'Easy',
    prompt: 'A right triangle has legs of length 3 and 4. What is the hypotenuse?',
    choices: ['5', '6', '7', '12'],
    correctIndex: 0,
    explanation: 'By the Pythagorean theorem, c = √(3² + 4²) = √25 = 5.',
  },
  {
    id: 'pb-m5',
    section: 'Math',
    topic: 'Percentages',
    difficulty: 'Medium',
    prompt: 'A shirt costs $40 after a 20% discount. What was the original price?',
    choices: ['$48', '$50', '$60', '$80'],
    correctIndex: 1,
    explanation: '$40 is 80% of the original. Original = 40 / 0.8 = $50.',
  },
  {
    id: 'pb-m6',
    section: 'Math',
    topic: 'Statistics',
    difficulty: 'Easy',
    prompt: 'What is the mean of the data set {4, 8, 10, 14}?',
    choices: ['8', '9', '10', '12'],
    correctIndex: 1,
    explanation: 'Sum is 36; divide by 4 values to get a mean of 9.',
  },
  {
    id: 'pb-r1',
    section: 'Reading & Writing',
    topic: 'Punctuation',
    difficulty: 'Easy',
    prompt:
      'Choose the correct option: "The lab was crowded ___ we found two open seats."',
    choices: [', so', ' so', '; so', ', but so'],
    correctIndex: 0,
    explanation:
      'Two independent clauses joined by the conjunction "so" need a comma before it.',
  },
  {
    id: 'pb-r2',
    section: 'Reading & Writing',
    topic: 'Apostrophes',
    difficulty: 'Easy',
    prompt: 'Which sentence is correct?',
    choices: [
      'The dog wagged it\'s tail.',
      'The dog wagged its tail.',
      'The dog wagged its\' tail.',
      'The dog wagged its tail\'s.',
    ],
    correctIndex: 1,
    explanation: '"Its" is the possessive form. "It\'s" means "it is".',
  },
  {
    id: 'pb-r3',
    section: 'Reading & Writing',
    topic: 'Transitions',
    difficulty: 'Medium',
    prompt:
      'The results were promising. ___, more testing is needed before any conclusions.',
    choices: ['Therefore', 'However', 'For example', 'Similarly'],
    correctIndex: 1,
    explanation:
      'The second sentence contrasts the promising results, so a contrast transition like "However" fits.',
  },
  {
    id: 'pb-r4',
    section: 'Reading & Writing',
    topic: 'Subject-verb agreement',
    difficulty: 'Medium',
    prompt: 'Choose the correct verb: "The box of old photographs ___ on the shelf."',
    choices: ['sit', 'sits', 'are sitting', 'have sat'],
    correctIndex: 1,
    explanation:
      'The subject is "box" (singular). Ignore "of old photographs", so use "sits".',
  },
  {
    id: 'pb-r5',
    section: 'Reading & Writing',
    topic: 'Colons',
    difficulty: 'Hard',
    prompt: 'Which uses a colon correctly?',
    choices: [
      'She packed: snacks, water, and a map.',
      'She packed three things: snacks, water, and a map.',
      'She packed three things, snacks: water, and a map.',
      'She: packed three things, snacks, water, and a map.',
    ],
    correctIndex: 1,
    explanation:
      'A colon must follow a complete sentence. "She packed three things" stands alone.',
  },
  {
    id: 'pb-r6',
    section: 'Reading & Writing',
    topic: 'Reading',
    difficulty: 'Medium',
    prompt:
      'An author writes that a policy is "well-intentioned but deeply flawed." The tone is best described as:',
    choices: ['Enthusiastic', 'Critical', 'Indifferent', 'Admiring'],
    correctIndex: 1,
    explanation:
      '"Deeply flawed" signals criticism, even though the author acknowledges good intentions.',
  },
  {
    id: 'pb-m7',
    section: 'Math',
    topic: 'Exponents',
    difficulty: 'Medium',
    prompt: 'If 2^x = 32, what is the value of x?',
    choices: ['4', '5', '6', '16'],
    correctIndex: 1,
    explanation: '32 = 2^5, so x = 5.',
  },
  {
    id: 'pb-m8',
    section: 'Math',
    topic: 'Systems of equations',
    difficulty: 'Hard',
    prompt: 'If x + y = 10 and x − y = 4, what is x?',
    choices: ['3', '5', '6', '7'],
    correctIndex: 3,
    explanation: 'Add the equations: 2x = 14, so x = 7.',
  },
  {
    id: 'pb-m9',
    section: 'Math',
    topic: 'Ratios',
    difficulty: 'Easy',
    prompt: 'A recipe uses 2 cups of flour for every 3 cups of sugar. For 9 cups of sugar, how much flour is needed?',
    choices: ['4 cups', '6 cups', '8 cups', '12 cups'],
    correctIndex: 1,
    explanation: '9 cups of sugar is 3 times the ratio amount, so 2 × 3 = 6 cups of flour.',
  },
  {
    id: 'pb-r7',
    section: 'Reading & Writing',
    topic: 'Parallel structure',
    difficulty: 'Medium',
    prompt: 'Choose the option that keeps the list parallel: "She likes hiking, swimming, and ___."',
    choices: ['to bike', 'biking', 'she bikes', 'bike'],
    correctIndex: 1,
    explanation: 'To match "hiking" and "swimming", the third item should be the -ing form "biking".',
  },
  {
    id: 'pb-r8',
    section: 'Reading & Writing',
    topic: 'Evidence questions',
    difficulty: 'Hard',
    prompt:
      'A claim states a town\'s recycling rose sharply after a new program. Which finding best supports it?',
    choices: [
      'Residents said they liked the program.',
      'Recycling tonnage increased 60% the year the program launched.',
      'The program was featured in the local news.',
      'Neighboring towns also recycle.',
    ],
    correctIndex: 1,
    explanation:
      'Direct measured data tied to the program (a 60% increase) is the strongest evidence for the claim.',
  },
]

export function fallbackQuestions(
  section: Section | 'Both',
  count: number,
): PracticeQuestion[] {
  const pool =
    section === 'Both'
      ? PRACTICE_BANK
      : PRACTICE_BANK.filter((q) => q.section === section)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * A balanced diagnostic set (used when the AI gateway is unavailable).
 * Splits roughly evenly between Math and Reading & Writing.
 */
export function diagnosticFallback(count = 15): PracticeQuestion[] {
  const mathCount = Math.ceil(count / 2)
  const rwCount = count - mathCount
  const math = fallbackQuestions('Math', mathCount)
  const rw = fallbackQuestions('Reading & Writing', rwCount)
  // Interleave so the test alternates sections.
  const out: PracticeQuestion[] = []
  const max = Math.max(math.length, rw.length)
  for (let i = 0; i < max; i++) {
    if (math[i]) out.push(math[i])
    if (rw[i]) out.push(rw[i])
  }
  return out.slice(0, count)
}
