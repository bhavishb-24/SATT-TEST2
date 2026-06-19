import type { StudyPlan } from './sat-types'

// A clearly-labeled, generic high-yield plan used ONLY when all AI providers fail.
// It contains no personalized numbers, no fake score gains, and no invented probabilities.
export function buildFallbackPlan(
  sleepLabel: string,
  wakeLabel: string,
  sprint: boolean,
): StudyPlan {
  const topics: StudyPlan['topics'] = [
    {
      name: 'Linear equations & algebra',
      section: 'Math',
      time_minutes: sprint ? 20 : 40,
      score_impact_percent: 85,
      difficulty: 'Quick win',
      why_it_matters:
        'Linear equations and basic algebra appear more than almost any other topic on the SAT Math section. Getting these consistently right is the fastest way to raise a math score.',
      action_steps: [
        'Write out the steps to solve for x in a two-step equation, saying each move out loud.',
        'Practice isolating a variable: move constants first, then divide by the coefficient.',
        'Rewrite one word sentence as an equation, e.g. "5 more than twice a number is 17".',
        'Self-check: Can you solve 3x + 4 = 19 in under 30 seconds? If yes, move on. If no, spend 5 more minutes here.',
      ],
      stuck_explanation:
        'An equation is just a balance. Whatever you do to one side, do to the other until x is alone.',
      confidence_low_steps: [
        'Solve x + 2 = 6 by subtracting 2 from both sides.',
        'Now try 2x = 10 by dividing both sides by 2.',
      ],
      morning_reminder:
        'For algebra, isolate the variable one step at a time — keep both sides balanced.',
    },
    {
      name: 'Grammar & punctuation',
      section: 'Reading & Writing',
      time_minutes: sprint ? 20 : 35,
      score_impact_percent: 82,
      difficulty: 'Quick win',
      why_it_matters:
        'Grammar and punctuation questions follow a small set of repeatable rules. Learning the comma and verb rules tonight pays off immediately.',
      action_steps: [
        'Review the rule: use a comma before a coordinating conjunction (FANBOYS) joining two full sentences.',
        'Read three sentences aloud and place commas where you naturally pause for clarity.',
        'Practice subject–verb agreement: match a singular subject with a singular verb.',
        'Self-check: Can you spot a run-on sentence in a paragraph? If yes, move on. If no, spend 5 more minutes here.',
      ],
      stuck_explanation:
        'Most SAT grammar questions test one rule at a time. Find the verb and its subject first, then check the punctuation.',
      confidence_low_steps: [
        'A comma separates items in a list: red, white, and blue.',
        'A period ends one complete thought before a new one begins.',
      ],
      morning_reminder:
        'For grammar, find the subject and verb first, then check punctuation around them.',
    },
    {
      name: 'Reading comprehension',
      section: 'Reading & Writing',
      time_minutes: sprint ? 0 : 35,
      score_impact_percent: 70,
      difficulty: 'Medium lift',
      why_it_matters:
        'Reading questions reward finding evidence in the passage rather than relying on memory. A simple strategy boosts accuracy fast.',
      action_steps: [
        'Read a short paragraph and summarize its main idea in one sentence.',
        'Underline the sentence that directly answers a "what does the author mean" question.',
        'Practice eliminating two clearly wrong answers before choosing.',
        'Self-check: Can you point to the exact line that supports your answer? If yes, move on. If no, spend 5 more minutes here.',
      ],
      stuck_explanation:
        'The answer is always in the passage. Find the line that proves it instead of guessing.',
      confidence_low_steps: [
        'Read one sentence and say what it is mostly about.',
        'Pick the answer that matches that sentence most closely.',
      ],
      morning_reminder:
        'For reading, the correct answer is supported by a specific line — find it.',
    },
    {
      name: 'Data analysis',
      section: 'Math',
      time_minutes: sprint ? 0 : 30,
      score_impact_percent: 68,
      difficulty: 'Medium lift',
      why_it_matters:
        'Data and graph questions test careful reading of charts more than hard math. Slowing down to read labels prevents easy mistakes.',
      action_steps: [
        'Read the title and axis labels of a chart before looking at any numbers.',
        'Practice finding a percent: part divided by whole, times 100.',
        'Interpret one trend in a table by comparing two rows.',
        'Self-check: Can you read a value off a graph correctly on the first try? If yes, move on. If no, spend 5 more minutes here.',
      ],
      stuck_explanation:
        'Charts give you all the information you need. Read the labels carefully before doing any math.',
      confidence_low_steps: [
        'Find the highest bar on a bar chart and name its value.',
        'Compare two values and say which is larger.',
      ],
      morning_reminder:
        'For data questions, read the chart labels first — the answer is usually right there.',
    },
  ]

  const usable = sprint ? topics.filter((t) => t.time_minutes > 0).slice(0, 2) : topics

  return {
    summary: {
      motivational_message:
        'You are taking the right step by preparing now. Focused effort tonight beats panic — let’s cover the highest-value basics.',
      estimated_score_improvement: null,
      sleep_deadline: sleepLabel,
      wake_up_time: wakeLabel,
      total_topics: usable.length,
    },
    topics: usable,
    skip_topics: [
      {
        name: 'Trigonometry',
        reason: 'Few questions and high effort to learn the night before — skip tonight.',
      },
      {
        name: 'Advanced math (polynomials, functions)',
        reason: 'Takes longer to build than basics; focus on higher-frequency topics first.',
      },
      {
        name: 'Vocabulary memorization',
        reason: 'The SAT tests vocabulary in context, so cramming word lists has low payoff.',
      },
    ],
    top_math_tips: [
      'Isolate the variable one step at a time in algebra.',
      'Read every chart label before doing the math.',
      'Skip a hard question and come back — every question is worth the same.',
    ],
    top_rw_tips: [
      'Find the subject and verb before judging grammar.',
      'Support every reading answer with a specific line.',
      'Eliminate two wrong answers before choosing.',
    ],
  }
}
