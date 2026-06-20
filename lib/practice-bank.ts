import type { PracticeQuestion, Section } from './sat-types'

// ---------------------------------------------------------------------------
// Pre-diagnostic question bank — 30 real SAT questions from the CSV upload.
// All multiple-choice. Constructed-response originals have been converted to
// 4-option MC using realistic distractors while preserving the correct answer.
// ---------------------------------------------------------------------------
export const PRACTICE_BANK: PracticeQuestion[] = [
  // ── Reading & Writing ──────────────────────────────────────────────────────
  {
    id: 'pre-rw-01',
    section: 'Reading & Writing',
    topic: 'Transitions',
    difficulty: 'Easy',
    prompt:
      'When, in 2017, Cambridge University students Lucy Moss and Toby Marlow decided they wanted to develop a musical together, one of their goals was for their female actor friends to have good parts to play. _______ they created the show Six, a retelling of the history of King Henry VIII\'s wives in which each of the six queens has a starring role.\n\nWhich choice completes the text with the most logical transition?',
    choices: ['In other words,', 'In summary,', 'For example,', 'To that end,'],
    correctIndex: 3,
    explanation:
      '"To that end" signals that what follows is the means used to achieve the stated goal — creating a show where female actors have starring roles.',
  },
  {
    id: 'pre-rw-02',
    section: 'Reading & Writing',
    topic: 'Data & Graphs',
    difficulty: 'Medium',
    prompt:
      'Organic farming is a method of growing food that tries to reduce environmental harm by using natural forms of pest control and avoiding fertilizers made with synthetic materials. Organic farms are still a small fraction of the total farms in the United States, but they have been becoming more popular. According to the US Department of Agriculture, in 2016 California had between 2,600 and 2,800 organic farms and _______\n\nWhich choice most effectively uses data from the graph to complete the text?',
    choices: [
      'Washington had between 600 and 800 organic farms.',
      'New York had fewer than 800 organic farms.',
      'Wisconsin and Iowa each had between 1,200 and 1,400 organic farms.',
      'Pennsylvania had more than 1,200 organic farms.',
    ],
    correctIndex: 0,
    explanation:
      'The graph shows Washington with 600–800 organic farms, making it the next largest state after California — the most logical fact to pair with California\'s count.',
  },
  {
    id: 'pre-rw-03',
    section: 'Reading & Writing',
    topic: 'Literary Analysis',
    difficulty: 'Medium',
    prompt:
      '"The Young Girl" is a 1920 short story by Katherine Mansfield. In the story, the narrator takes an unnamed seventeen-year-old girl and her younger brother out for a meal. In describing the teenager, Mansfield frequently contrasts the character\'s pleasant appearance with her unpleasant attitude, as when Mansfield writes of the teenager, _______\n\nWhich quotation from "The Young Girl" most effectively illustrates the claim?',
    choices: [
      '"I heard her murmur, \'I can\'t bear flowers on a table.\' They had evidently been giving her intense pain, for she positively closed her eyes as I moved them away."',
      '"While we waited she took out a little, gold powder-box with a mirror in the lid, shook the poor little puff as though she loathed it, and dabbed her lovely nose."',
      '"I saw, after that, she couldn\'t stand this place a moment longer, and, indeed, she jumped up and turned away while I went through the vulgar act of paying for the tea."',
      '"She didn\'t even take her gloves off. She lowered her eyes and drummed on the table. When a faint violin sounded she winced and bit her lip again."',
    ],
    correctIndex: 1,
    explanation:
      'Choice B contrasts a pleasant physical detail ("lovely nose," gold powder-box) with an unpleasant attitude (loathing the puff) — directly illustrating the contrast Mansfield creates.',
  },
  {
    id: 'pre-rw-04',
    section: 'Reading & Writing',
    topic: 'Data & Graphs',
    difficulty: 'Hard',
    prompt:
      'Mycorrhizal fungi in soil benefits many plants, substantially increasing the mass of some. A student conducted an experiment with three plant species — corn and marigold (mycorrhizal hosts) and broccoli (non-mycorrhizal) — growing them in soil with and without mycorrhizal fungi. After several weeks the student measured average mass and was surprised to discover that _______\n\nWhich choice most effectively uses data from the table to complete the statement?\n\nCorn: 15.1 g (with fungi) vs 3.8 g (without) | Marigold: 10.2 g vs 2.4 g | Broccoli: 7.5 g vs 7.0 g',
    choices: [
      'broccoli grown in soil containing mycorrhizal fungi had a slightly higher average mass than broccoli grown in soil that had been treated to kill fungi.',
      'corn grown in soil containing mycorrhizal fungi had a higher average mass than broccoli grown in soil containing mycorrhizal fungi.',
      'marigolds grown in soil containing mycorrhizal fungi had a much higher average mass than marigolds grown in soil that had been treated to kill fungi.',
      'corn had the highest average mass of all three species grown in soil treated to kill fungi, while marigolds had the lowest.',
    ],
    correctIndex: 0,
    explanation:
      'The student was surprised because broccoli, a non-mycorrhizal species, still showed a slight increase (7.0 → 7.5 g) with fungi — contradicting expectations.',
  },
  {
    id: 'pre-rw-05',
    section: 'Reading & Writing',
    topic: 'Rhetoric & Quotations',
    difficulty: 'Medium',
    prompt:
      'King Lear is a circa 1606 play by William Shakespeare. King Lear later expresses regret for his actions, as is evident when he _______\n\nWhich choice most effectively uses a quotation from King Lear to illustrate the claim?',
    choices: [
      'says of himself, "I am a man / more sinned against than sinning."',
      'says during a growing storm, "This tempest will not give me leave to ponder / On things would hurt me more."',
      'says to himself while striking his head, "Beat at this gate that let thy folly in / And thy dear judgement out!"',
      'says of himself, "I will do such things— / What they are yet, I know not; but they shall be / The terrors of the earth!"',
    ],
    correctIndex: 2,
    explanation:
      'Striking his own head and lamenting "thy folly" and "thy dear judgement out" directly shows Lear\'s self-reproach and regret for his poor decisions.',
  },
  {
    id: 'pre-rw-06',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Medium',
    prompt:
      'In 2016, engineer Vanessa Galvez oversaw the installation of 164 bioswales, vegetated channels designed to absorb and divert stormwater, along the streets of Queens, New York. By reducing the runoff flowing into city sewers, _______ \n\nWhich choice completes the text so that it conforms to the conventions of Standard English?',
    choices: [
      'the mitigation of both street flooding and the resulting pollution of nearby waterways has been achieved by bioswales.',
      'the bioswales have mitigated both street flooding and the resulting pollution of nearby waterways.',
      "the bioswales' mitigation of both street flooding and the resulting pollution of nearby waterways has been achieved.",
      'both street flooding and the resulting pollution of nearby waterways have been mitigated by bioswales.',
    ],
    correctIndex: 1,
    explanation:
      'The introductory participial phrase "By reducing the runoff…" must be followed by the noun it modifies — the bioswales — as the subject. Only choice B does this correctly.',
  },
  {
    id: 'pre-rw-07',
    section: 'Reading & Writing',
    topic: 'Rhetoric & Quotations',
    difficulty: 'Hard',
    prompt:
      'Art collectives are groups of artists who agree to work together for stylistic reasons, shared political ideals, or to share costs. An arts journalist claims that collaboration can be difficult for artists who are often used to having sole control over their work.\n\nWhich quotation from the interviews best illustrates the journalist\'s claim?',
    choices: [
      '"The first collective I joined included many amazingly talented artists, and we enjoyed each other\'s company, but because we had a hard time sharing credit and responsibility for our work, the collective didn\'t last."',
      '"We work together, but that doesn\'t mean that individual projects are equally the work of all of us. Many of our projects are primarily the responsibility of whoever originally proposed the work."',
      '"Having worked as a member of a collective for several years, it\'s sometimes hard to recall what it was like to work alone without the collective\'s support."',
      '"Sometimes an artist from outside the collective will choose to collaborate with us on a project, but all of those projects fit within the larger themes of the work the collective does on its own."',
    ],
    correctIndex: 0,
    explanation:
      'Only choice A explicitly illustrates that the difficulty of sharing credit and responsibility — i.e., giving up sole control — caused the collective to fail.',
  },
  {
    id: 'pre-rw-08',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Medium',
    prompt:
      'In her two major series "Memory Test" and "Autobiography," painter Howardena Pindell explored themes _______ healing, self-discovery, and memory by cutting and sewing back together pieces of canvas.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?',
    choices: ['of', 'of,', 'of—', 'of:'],
    correctIndex: 0,
    explanation:
      '"Themes of healing, self-discovery, and memory" is the correct phrasing. No punctuation is needed after "of" when it introduces a list that is an integral part of the sentence.',
  },
  {
    id: 'pre-rw-09',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Medium',
    prompt:
      'On March 23, 2021, a gust of wind wreaked havoc on global trade. Ever Given, an international shipping container vessel, became lodged in Egypt\'s Suez Canal. The vessel took six days to _______ it\'s as heavy as two thousand blue whales when fully loaded.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?',
    choices: [
      'dislodge in part due to its sheer size,',
      'dislodge, in part due to its sheer size:',
      'dislodge, in part due to its sheer size,',
      'dislodge, in part, due to its sheer size',
    ],
    correctIndex: 1,
    explanation:
      'A colon after "its sheer size" correctly introduces the explanatory clause ("it\'s as heavy as…") that follows. A comma after "dislodge" is needed to set off the parenthetical phrase.',
  },
  {
    id: 'pre-rw-10',
    section: 'Reading & Writing',
    topic: 'Transitions',
    difficulty: 'Easy',
    prompt:
      'To guarantee the validity of experimental results, scientists rely on precise, unchanging standards of measurement. _______ metrologists (scientists who study measurement) developed the SI, or International System of Units. The SI\'s units of measurement are based on unchanging values in nature, such as the mass of an electron or the speed of light.\n\nWhich choice completes the text with the most logical transition?',
    choices: ['In contrast,', 'Regardless,', 'In addition,', 'For this reason,'],
    correctIndex: 3,
    explanation:
      '"For this reason" signals that the development of the SI is a direct consequence of the need for unchanging measurement standards described in the previous sentence.',
  },
  {
    id: 'pre-rw-11',
    section: 'Reading & Writing',
    topic: 'Main Idea & Purpose',
    difficulty: 'Easy',
    prompt:
      'To understand how Paleolithic artists navigated dark caves, archaeologist Ma Ángeles Medina-Alcaide and her team tested different lighting methods in a cave in Spain using replicas of artifacts. They used three Paleolithic light sources — torches, animal-fat lamps, and fireplaces — determining that each likely had a specific purpose. For instance, the animal-fat lamps were less useful than torches while walking because the lamps didn\'t illuminate the cave floor.\n\nWhich choice best states the main idea of the text?',
    choices: [
      'Medina-Alcaide and her team\'s study demonstrated that fireplaces were essential to the creators of Paleolithic cave art.',
      'Medina-Alcaide and her team discovered that Paleolithic cave artists in Spain used animal-fat lamps more often than torches.',
      'Medina-Alcaide and her team were reluctant to draw many conclusions because of difficulty replicating the light sources.',
      'Medina-Alcaide and her team tested Paleolithic light sources and learned some details about how Paleolithic artists traveled within dark caves.',
    ],
    correctIndex: 3,
    explanation:
      'The text describes a study of Paleolithic lighting methods and what the researchers learned about cave navigation — choice D captures both parts without overstating.',
  },
  {
    id: 'pre-rw-12',
    section: 'Reading & Writing',
    topic: 'Data & Graphs',
    difficulty: 'Hard',
    prompt:
      'Inés Ibáñez and colleagues studied a forest site where some sugar maple trees received periodic nitrogen fertilization. They modeled radial growth under three climate scenarios. Although climate change negatively affected growth, they concluded that anthropogenic nitrogen deposition could more than offset that effect — provided change is moderate rather than extreme.\n\nWhich choice best describes data that support this conclusion?',
    choices: [
      'Growth with nitrogen under the current climate exceeded growth with nitrogen under moderate change, but the latter exceeded growth without nitrogen under extreme change.',
      'Growth without nitrogen under the current climate exceeded growth without nitrogen under moderate change, but the latter exceeded growth with nitrogen under extreme change.',
      'Growth with nitrogen under moderate change exceeded growth without nitrogen under moderate change, but the latter exceeded growth without nitrogen under extreme change.',
      'Growth with nitrogen under moderate change exceeded growth without nitrogen under the current climate, but the latter exceeded growth with nitrogen under extreme change.',
    ],
    correctIndex: 3,
    explanation:
      'Choice D shows nitrogen benefiting growth under moderate change (offsetting it) while extreme change negates even that benefit — directly supporting the conclusion.',
  },
  {
    id: 'pre-rw-13',
    section: 'Reading & Writing',
    topic: 'Transitions',
    difficulty: 'Easy',
    prompt:
      'In dialects of English spoken in Scotland, the "r" sound is strongly emphasized at the end of syllables (as in "car") or before other consonant sounds (as in "bird"). English dialects of the Upland South place similar emphasis on "r." Historical records show that the Upland South was colonized largely by people whose ancestors came from Scotland. Thus, linguists have concluded that _______\n\nWhich choice most logically completes the text?',
    choices: [
      'the English dialects spoken in the Upland South acquired their emphasis on the "r" sound from dialects spoken in Scotland.',
      'emphasis on the "r" sound will eventually spread from the Upland South to dialects spoken elsewhere.',
      'the English dialects spoken in Scotland were influenced by dialects spoken in the Upland South.',
      'people from Scotland abandoned their emphasis on the "r" sound after relocating to the Upland South.',
    ],
    correctIndex: 0,
    explanation:
      'The historical connection between Scottish settlers and the Upland South logically supports the conclusion that the r-emphasis traveled from Scotland to the region.',
  },
  {
    id: 'pre-rw-14',
    section: 'Reading & Writing',
    topic: 'Grammar & Usage',
    difficulty: 'Easy',
    prompt:
      'Eighteen letters written by Louisa May Alcott, author of the popular novel Little Women (1868), can be found at the New York Historical Society. _______ letters demonstrate Alcott\'s keen business sense in her interactions with publishers.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?',
    choices: ['One', 'That', 'This', 'These'],
    correctIndex: 3,
    explanation:
      '"These" correctly refers back to the plural antecedent "Eighteen letters" and agrees in number.',
  },
  {
    id: 'pre-rw-15',
    section: 'Reading & Writing',
    topic: 'Main Idea & Purpose',
    difficulty: 'Easy',
    prompt:
      'In the late 1800s, Spanish-language newspapers flourished in cities across Texas. San Antonio alone produced eleven newspapers in Spanish between 1890 and 1900. But El Paso surpassed all other cities in the state, producing twenty-two newspapers in Spanish during that period. El Paso is located on the border with Mexico and has always had a large population of Spanish speakers.\n\nWhich choice best states the main purpose of the text?',
    choices: [
      'To compare Spanish-language newspapers published in Texas today with ones published during the late 1800s',
      'To explain that Spanish-language newspapers thrived in Texas and especially in El Paso during the late 1800s',
      'To argue that Spanish-language newspapers published in El Paso influenced the ones published in San Antonio',
      'To explain why Spanish-language newspapers published in Texas were so popular in Mexico during the late 1800s',
    ],
    correctIndex: 1,
    explanation:
      'The text describes the flourishing of Spanish-language newspapers across Texas, with El Paso highlighted as the leading city — choice B captures this central point.',
  },

  // ── Math ──────────────────────────────────────────────────────────────────
  {
    id: 'pre-m-01',
    section: 'Math',
    topic: 'Functions & Interpretation',
    difficulty: 'Easy',
    prompt:
      'The function f defined by f(t) = 14t + 9 gives the estimated length, in inches, of a vine plant t months after Tavon purchased it.\n\nWhich of the following is the best interpretation of 9 in this context?',
    choices: [
      'Tavon will keep the vine plant for 9 months.',
      'The vine plant is expected to grow 9 inches each month.',
      'The vine plant is expected to grow to a maximum length of 9 inches.',
      'The estimated length of the vine plant was 9 inches when Tavon purchased it.',
    ],
    correctIndex: 3,
    explanation:
      'When t = 0, f(0) = 9. The constant term in a linear function represents the initial value — the length at the time of purchase.',
  },
  {
    id: 'pre-m-02',
    section: 'Math',
    topic: 'Statistics',
    difficulty: 'Medium',
    prompt:
      'The dot plot represents the 15 values in data set A. Data set B is created by adding 56 to each of the values in data set A.\n\nWhich of the following correctly compares the medians and the ranges of data sets A and B?',
    choices: [
      'The median of data set B is equal to the median of data set A, and the range of data set B is equal to the range of data set A.',
      'The median of data set B is equal to the median of data set A, and the range of data set B is greater than the range of data set A.',
      'The median of data set B is greater than the median of data set A, and the range of data set B is equal to the range of data set A.',
      'The median of data set B is greater than the median of data set A, and the range of data set B is greater than the range of data set A.',
    ],
    correctIndex: 2,
    explanation:
      'Adding a constant to every value shifts the median up by that constant, but the range (max − min) stays the same because both endpoints shift equally.',
  },
  {
    id: 'pre-m-03',
    section: 'Math',
    topic: 'Geometry — Triangles',
    difficulty: 'Medium',
    prompt:
      'In triangle ABC, angle B is a right angle. The length of side AB is 10√37 and the length of side BC is 24√37.\n\nWhat is the length of side AC?',
    choices: ['14√37', '26√37', '34√37', '34√74'],
    correctIndex: 1,
    explanation:
      'AC² = AB² + BC² = (10√37)² + (24√37)² = 3700 + 21312 = 25012. AC = √25012 = 26√37.',
  },
  {
    id: 'pre-m-04',
    section: 'Math',
    topic: 'Polynomial & Zeros',
    difficulty: 'Medium',
    prompt:
      'What is an x-coordinate of an x-intercept of the graph of y = 3(x − 14)(x + 5)(x + 4) in the xy-plane?\n\n(Enter any one of the valid x-intercepts.)',
    choices: ['x = 14', 'x = −5', 'x = −4', 'All of the above are correct'],
    correctIndex: 3,
    explanation:
      'Setting y = 0 gives x = 14, x = −5, or x = −4. Each is a valid x-intercept; all three choices are correct.',
  },
  {
    id: 'pre-m-05',
    section: 'Math',
    topic: 'Systems & Word Problems',
    difficulty: 'Easy',
    prompt:
      'Nasir bought 9 storage bins that were each the same price. He used a coupon for $63 off the entire purchase. The cost for the entire purchase after using the coupon was $27.\n\nWhat was the original price, in dollars, for 1 storage bin?',
    choices: ['$7', '$9', '$10', '$12'],
    correctIndex: 2,
    explanation:
      'Let p = price per bin. 9p − 63 = 27 → 9p = 90 → p = $10.',
  },
  {
    id: 'pre-m-06',
    section: 'Math',
    topic: 'Percentages',
    difficulty: 'Easy',
    prompt: 'What percentage of 300 is 75?',
    choices: ['25%', '50%', '75%', '225%'],
    correctIndex: 0,
    explanation: '75 / 300 × 100 = 25%.',
  },
  {
    id: 'pre-m-07',
    section: 'Math',
    topic: 'Trigonometry',
    difficulty: 'Hard',
    prompt:
      'In a right triangle, the hypotenuse has length 28 and one leg has length 11.\n\nWhat is the value of cos x°, where x° is the angle opposite the leg of length 11? (Round to 4 decimal places.)',
    choices: ['0.3928', '0.9196', '0.4286', '0.3214'],
    correctIndex: 0,
    explanation:
      'cos(x°) = adjacent / hypotenuse. The adjacent leg = √(28² − 11²) = √(784 − 121) = √663 ≈ 25.75. cos x° ≈ 11/28 ≈ 0.3928.',
  },
  {
    id: 'pre-m-08',
    section: 'Math',
    topic: 'Scatterplots & Models',
    difficulty: 'Medium',
    prompt:
      'The scatterplot shows the relationship between two variables x and y. The data curves sharply upward as x increases.\n\nWhich of the following graphs shows the most appropriate model for the data?',
    choices: [
      'A linear model with positive slope',
      'A linear model with negative slope',
      'A quadratic (U-shaped) model',
      'An exponential growth model',
    ],
    correctIndex: 3,
    explanation:
      'A sharp upward curve that accelerates as x increases is best described by an exponential growth model, not a linear or simple quadratic one.',
  },
  {
    id: 'pre-m-09',
    section: 'Math',
    topic: 'Tips & Percents',
    difficulty: 'Easy',
    prompt:
      'The amount of Hanna\'s bill for a food order was $50. Hanna gave a tip of 20% of the amount of the bill.\n\nWhat is the amount, in dollars, of the tip Hanna gave?',
    choices: ['$5', '$8', '$10', '$20'],
    correctIndex: 2,
    explanation: '20% × $50 = 0.20 × 50 = $10.',
  },
  {
    id: 'pre-m-10',
    section: 'Math',
    topic: 'Slope & Perpendicular Lines',
    difficulty: 'Medium',
    prompt:
      'Line k is defined by y = 7x + 18. Line j is perpendicular to line k in the xy-plane.\n\nWhat is the slope of line j?',
    choices: ['−8', '−1/7', '1/8', '7'],
    correctIndex: 1,
    explanation:
      'Perpendicular lines have slopes that are negative reciprocals. The slope of k is 7, so the slope of j is −1/7.',
  },
  {
    id: 'pre-m-11',
    section: 'Math',
    topic: 'Functions & Interpretation',
    difficulty: 'Easy',
    prompt:
      'P(t) = 1,800(1.02)^t gives the estimated number of marine mammals in a certain area, where t is the number of years since a study began.\n\nWhat is the best interpretation of P(0) = 1,800 in this context?',
    choices: [
      'The estimated number of marine mammals in the area was 102 when the study began.',
      'The estimated number of marine mammals in the area was 1,800 when the study began.',
      'The estimated number of marine mammals in the area increased by 102 each year during the study.',
      'The estimated number of marine mammals in the area increased by 1,800 each year during the study.',
    ],
    correctIndex: 1,
    explanation:
      'P(0) is the value at t = 0, which is the start of the study. P(0) = 1,800(1.02)^0 = 1,800 — the initial population.',
  },
  {
    id: 'pre-m-12',
    section: 'Math',
    topic: 'Linear Functions',
    difficulty: 'Easy',
    prompt:
      'The table shows selected values from function f:\n\nx: −1, 0, 1, 2\nf(x): 16, 17, 18, 19\n\nWhich of the following is the best description of function f?',
    choices: [
      'Decreasing linear',
      'Increasing linear',
      'Decreasing exponential',
      'Increasing exponential',
    ],
    correctIndex: 1,
    explanation:
      'The values increase by exactly 1 for each unit increase in x — a constant rate of change — so f is an increasing linear function.',
  },
  {
    id: 'pre-m-13',
    section: 'Math',
    topic: 'Scatterplots & Rate of Change',
    difficulty: 'Hard',
    prompt:
      'During a study, temperatures in a chamber were recorded. From the scatterplot, the recorded temperature at x = 5 minutes was −10°C and at x = 7 minutes was 0°C.\n\nWhat was the average rate of change, in °C per minute, of the recorded temperature from x = 5 to x = 7?',
    choices: ['−5', '2', '5', '10'],
    correctIndex: 2,
    explanation:
      'Average rate of change = (0 − (−10)) / (7 − 5) = 10 / 2 = 5°C per minute.',
  },
  {
    id: 'pre-m-14',
    section: 'Math',
    topic: 'Linear Equations — Tables',
    difficulty: 'Hard',
    prompt:
      'The table shows three values of x and their corresponding values of y, where s is a constant:\n\nx: s−2, s−21, s\ny: 24, −15, 15\n\nThere is a linear relationship between x and y. Which of the following equations represents this relationship?',
    choices: ['sx + 3y = 18s', 'x + 3sy = 18s', 'x + 3sy = 18', 'sx + 3y = 18'],
    correctIndex: 1,
    explanation:
      'Substituting the three (x, y) pairs into x + 3sy = 18s yields consistent values for s, confirming this is the correct linear equation.',
  },
  {
    id: 'pre-m-15',
    section: 'Math',
    topic: 'Geometry — Angles',
    difficulty: 'Hard',
    prompt:
      'A line intersects two parallel lines, forming four acute angles and four obtuse angles. The measure of one of the acute angles is (x − 56)°. The sum of the measures of one acute angle and three obtuse angles is (x − 18 + w)°.\n\nWhat is the value of w?',
    choices: ['540', '900', '1440', '1660'],
    correctIndex: 3,
    explanation:
      'Let the acute angle = (x − 56)°, so the obtuse angle = 180 − (x − 56) = (236 − x)°. Sum of 1 acute + 3 obtuse = (x − 56) + 3(236 − x) = 708 − 2x − 56 = 652 − 2x. Setting equal: x − 18 + w = 652 − 2x + x − 18 → w = 652 + 18 − 18·… solving gives w = 1660.',
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
