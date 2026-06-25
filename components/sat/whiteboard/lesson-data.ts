// Scripted lesson content for the Whiteboard AI demo.
// The board has 9 "ink steps" (index 0..8). Each teaching stage reveals more of
// the drawing while the tutor narrates, never giving the answer until the end.

export const QUESTION = {
  number: 14,
  section: 'Math — Geometry',
  prompt:
    'In right triangle ABC, the right angle is at B. If AB = 6 and BC = 8, what is the length of the hypotenuse AC?',
}

// One narration line per ink step (kept in sync with <AiDrawing /> step gating).
export const STEP_NARRATION: string[] = [
  'Let me sketch the triangle from the problem.', // 0 triangle outline
  'See that little square at B? That means angle B is exactly ninety degrees.', // 1 right angle mark
  'One leg, A B, has a length of six.', // 2 label AB
  'The other leg, B C, has a length of eight.', // 3 label BC
  'And A C — the side across from the right angle — is what we want to find.', // 4 label AC ?
  'Because this is a right triangle, we can use the Pythagorean theorem.', // 5 a^2 + b^2 = c^2
  'Plug in our two legs: six squared plus eight squared.', // 6 substitute
  'Thirty-six plus sixty-four gives us one hundred.', // 7 = 100
  'So A C is the square root of one hundred — which is ten!', // 8 answer circled
]

export interface TeachStage {
  /** How many ink steps are revealed after this stage. */
  reveal: number
  /** What the tutor says in the chat. */
  message: string
  /** Label for the button that advances to the NEXT stage. */
  nextLabel: string
  /** Whether reaching this stage means the concept is mastered. */
  mastery?: boolean
}

// Progressive hint ladder — guiding questions first, full walkthrough last.
export const TEACH_STAGES: TeachStage[] = [
  {
    reveal: 2,
    message:
      "No problem — let's solve this together. First, look at the triangle I drew. What *kind* of triangle is this? Notice the little square at corner B.",
    nextLabel: 'I think it\u2019s a right triangle…',
  },
  {
    reveal: 4,
    message:
      "Exactly — it's a right triangle. Now, when you know the two shorter sides (the legs) and want the longest side, which famous formula comes to mind?",
    nextLabel: 'Give me a hint',
  },
  {
    reveal: 6,
    message:
      "Here's the hint: it's the one with three squared terms. We use **a² + b² = c²**, where c is the hypotenuse. Let's plug our numbers in together.",
    nextLabel: 'Show me visually',
  },
  {
    reveal: 8,
    message:
      "Watch the board: 6² + 8² = 36 + 64 = 100. So c² = 100. What's the last step to get c by itself?",
    nextLabel: 'Walk me through the finish',
  },
  {
    reveal: 9,
    message:
      "Take the square root of both sides: √100 = **10**. So AC = 10. You just solved it the way a tutor would — one visual step at a time. 🎉",
    nextLabel: 'I\u2019ve got it!',
    mastery: true,
  },
]

export const OPENING_MESSAGES = [
  { role: 'student' as const, content: "I don't understand question 14." },
]

export interface MemoryItem {
  icon: string
  text: string
  tone: 'good' | 'watch'
}

export const MEMORY_ITEMS: MemoryItem[] = [
  { icon: 'ti-run', text: 'You usually rush through algebra', tone: 'watch' },
  { icon: 'ti-trending-up', text: 'Geometry accuracy is improving', tone: 'good' },
  { icon: 'ti-book', text: 'Vocabulary mastery at 82%', tone: 'good' },
  { icon: 'ti-comma', text: 'Last struggled with comma rules', tone: 'watch' },
]

export const MEMORY_NUDGE =
  'Last week you rushed a Pythagorean problem just like this — let\'s slow down and label every side first.'

export interface SmartAction {
  icon: string
  label: string
  reply: string
}

export const SMART_ACTIONS: SmartAction[] = [
  {
    icon: 'ti-bulb',
    label: 'Explain simpler',
    reply:
      "Simple version: a right triangle's longest side² equals the sum of the other two sides². Square them, add, square-root. Done.",
  },
  {
    icon: 'ti-photo',
    label: 'Explain visually',
    reply: "Replaying the drawing — watch each side and label appear one at a time on the board.",
  },
  {
    icon: 'ti-copy',
    label: 'Show another example',
    reply:
      "Try this: a right triangle with legs 5 and 12. Same formula: 5² + 12² = 25 + 144 = 169, so the hypotenuse is √169 = 13.",
  },
  {
    icon: 'ti-help-circle',
    label: 'Give me a hint',
    reply: "Hint: the side opposite the right angle is always the hypotenuse — that's the 'c' in a² + b² = c².",
  },
  {
    icon: 'ti-flame',
    label: 'Challenge me',
    reply:
      "Challenge: a right triangle has a hypotenuse of 26 and one leg of 10. What's the other leg? (Hint: work the formula backwards.)",
  },
  {
    icon: 'ti-cards',
    label: 'Create flashcards',
    reply: "Made a flashcard: Front — 'Pythagorean theorem?' · Back — 'a² + b² = c² (c = hypotenuse).' Saved to your deck.",
  },
]

export const SESSION_SUMMARY = {
  conceptsLearned: ['Identifying right triangles', 'Pythagorean theorem (a² + b² = c²)', 'Solving for the hypotenuse'],
  mistakesCorrected: ['Rushing before labeling sides', 'Forgetting to square-root the final answer'],
  confidence: 88,
  nextTopic: 'Special right triangles (30-60-90 & 45-45-90)',
  homework: [
    'Legs 9 and 12 — find the hypotenuse.',
    'Hypotenuse 25, one leg 7 — find the other leg.',
    'Is a 7-24-25 triangle a right triangle?',
  ],
  flashcards: 2,
}
