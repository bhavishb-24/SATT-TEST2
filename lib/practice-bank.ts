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
  // --- Math questions 10–15 ---
  {
    id: 'pb-m10',
    section: 'Math',
    topic: 'Functions',
    difficulty: 'Medium',
    prompt: 'If f(x) = 3x − 7, what is f(4)?',
    choices: ['5', '12', '19', '1'],
    correctIndex: 0,
    explanation: 'f(4) = 3(4) − 7 = 12 − 7 = 5.',
  },
  {
    id: 'pb-m11',
    section: 'Math',
    topic: 'Inequalities',
    difficulty: 'Easy',
    prompt: 'Which value of x satisfies 2x − 3 > 7?',
    choices: ['x = 4', 'x = 5', 'x = 6', 'x = 3'],
    correctIndex: 2,
    explanation: '2x > 10 → x > 5. Only x = 6 satisfies this.',
  },
  {
    id: 'pb-m12',
    section: 'Math',
    topic: 'Geometry',
    difficulty: 'Medium',
    prompt: 'A circle has a radius of 5. What is its area? (Use π ≈ 3.14)',
    choices: ['15.7', '31.4', '78.5', '157'],
    correctIndex: 2,
    explanation: 'Area = πr² = 3.14 × 25 = 78.5.',
  },
  {
    id: 'pb-m13',
    section: 'Math',
    topic: 'Data interpretation',
    difficulty: 'Easy',
    prompt: 'A bar chart shows 20 students prefer math, 15 prefer science, and 5 prefer history. What fraction prefer history?',
    choices: ['1/8', '1/4', '1/5', '1/7'],
    correctIndex: 0,
    explanation: 'Total = 40 students. 5/40 = 1/8.',
  },
  {
    id: 'pb-m14',
    section: 'Math',
    topic: 'Trigonometry',
    difficulty: 'Hard',
    prompt: 'In a right triangle, if sin(θ) = 3/5, what is cos(θ)?',
    choices: ['3/4', '4/5', '4/3', '5/3'],
    correctIndex: 1,
    explanation: 'If sin(θ) = 3/5, the opposite is 3 and hypotenuse is 5, so adjacent = 4 (3-4-5 triangle). cos(θ) = 4/5.',
  },
  {
    id: 'pb-m15',
    section: 'Math',
    topic: 'Word problems',
    difficulty: 'Medium',
    prompt: 'Train A travels 60 mph and train B travels 90 mph. If they start at the same point and travel in opposite directions, how far apart are they after 2 hours?',
    choices: ['120 miles', '180 miles', '240 miles', '300 miles'],
    correctIndex: 3,
    explanation: 'Train A travels 120 miles, train B travels 180 miles. Total distance = 120 + 180 = 300 miles.',
  },
  // --- Reading & Writing questions 9–15 ---
  {
    id: 'pb-r9',
    section: 'Reading & Writing',
    topic: 'Word choice',
    difficulty: 'Medium',
    prompt: 'Which word best completes the sentence? "The scientist\'s findings were ___, challenging decades of accepted theory."',
    choices: ['mundane', 'predictable', 'groundbreaking', 'routine'],
    correctIndex: 2,
    explanation: '"Groundbreaking" fits a finding that challenges accepted theory; the others suggest nothing new.',
  },
  {
    id: 'pb-r10',
    section: 'Reading & Writing',
    topic: 'Main idea',
    difficulty: 'Medium',
    prompt: 'A paragraph describes how bees pollinate flowers, why pollination matters for ecosystems, and how pesticides threaten bee populations. The main idea is:',
    choices: [
      'Bees are the only pollinators.',
      'Pesticides should be banned entirely.',
      'Bees play a vital ecological role that is currently under threat.',
      'Flowers depend on wind, not insects.',
    ],
    correctIndex: 2,
    explanation: 'The paragraph covers the role of bees AND a threat to them — choice C captures both ideas.',
  },
  {
    id: 'pb-r11',
    section: 'Reading & Writing',
    topic: 'Semicolons',
    difficulty: 'Hard',
    prompt: 'Which sentence uses a semicolon correctly?',
    choices: [
      'I enjoy hiking; but the trail was muddy.',
      'She left early; she had a flight to catch.',
      'He ran fast; to win the race.',
      'The weather; was cold and rainy.',
    ],
    correctIndex: 1,
    explanation: 'A semicolon must join two independent clauses. Only choice B has two complete sentences on each side.',
  },
  {
    id: 'pb-r12',
    section: 'Reading & Writing',
    topic: 'Pronoun agreement',
    difficulty: 'Easy',
    prompt: 'Choose the correct pronoun: "Each of the students must bring ___ own pencil."',
    choices: ['their', 'his or her', 'its', 'our'],
    correctIndex: 1,
    explanation: '"Each" is singular, so the correct pronoun is "his or her" (formal singular).',
  },
  {
    id: 'pb-r13',
    section: 'Reading & Writing',
    topic: 'Author\'s purpose',
    difficulty: 'Medium',
    prompt: 'An author opens an essay with a vivid description of a polluted river. The most likely purpose is to:',
    choices: [
      'Entertain the reader with nature writing.',
      'Create an emotional appeal to highlight an environmental problem.',
      'Provide scientific data on water quality.',
      'Argue that rivers are not important.',
    ],
    correctIndex: 1,
    explanation: 'Vivid descriptions of pollution are a classic rhetorical move to make the reader feel the severity of the problem.',
  },
  {
    id: 'pb-r14',
    section: 'Reading & Writing',
    topic: 'Sentence combining',
    difficulty: 'Medium',
    prompt: 'Which best combines these sentences? "The storm was severe. Many roads were closed."',
    choices: [
      'The storm was severe, but many roads were closed.',
      'The storm was severe, so many roads were closed.',
      'The storm was severe, yet many roads were closed.',
      'The storm was severe, and however many roads were closed.',
    ],
    correctIndex: 1,
    explanation: '"So" shows cause and effect, which is the logical relationship between the severity of the storm and road closures.',
  },
  {
    id: 'pb-r15',
    section: 'Reading & Writing',
    topic: 'Vocabulary in context',
    difficulty: 'Hard',
    prompt: 'In the sentence "The new policy was met with vociferous opposition," "vociferous" most nearly means:',
    choices: ['quiet', 'loud and forceful', 'mild', 'well-reasoned'],
    correctIndex: 1,
    explanation: '"Vociferous" means loudly insistent or vehement — describing strong, vocal opposition.',
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
  // When more questions are requested than the bank holds (e.g. the 30-per-section
  // post-diagnostic), cycle through the pool again with suffixed ids so every
  // question stays unique by id and React keys don't collide.
  if (count > shuffled.length && shuffled.length > 0) {
    const out: PracticeQuestion[] = []
    for (let i = 0; i < count; i++) {
      const base = shuffled[i % shuffled.length]
      const pass = Math.floor(i / shuffled.length)
      out.push(pass === 0 ? base : { ...base, id: `${base.id}-r${pass}` })
    }
    return out
  }
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * A balanced diagnostic set (used when the AI is unavailable). Defaults to the
 * 15 Math + 15 Reading & Writing pre-diagnostic, but accepts larger counts for
 * the post-plan diagnostic (e.g. 30 + 30).
 */
export function diagnosticFallback(mathCount = 15, rwCount = 15): PracticeQuestion[] {
  const math = fallbackQuestions('Math', mathCount)
  const rw = fallbackQuestions('Reading & Writing', rwCount)
  // Interleave so the test alternates sections.
  const out: PracticeQuestion[] = []
  const max = Math.max(math.length, rw.length)
  for (let i = 0; i < max; i++) {
    if (math[i]) out.push(math[i])
    if (rw[i]) out.push(rw[i])
  }
  return out.slice(0, mathCount + rwCount)
}
