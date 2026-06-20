import type { PracticeQuestion } from './sat-types'

// ─────────────────────────────────────────────────────────────────────────────
// Mock Test 1 — SAT Practice Test 10
// 10 Reading & Writing + 10 Math, sourced directly from the official CSV.
// Graph-dependent or OCR-garbled questions are omitted; constructed-response
// questions are converted to 4-choice MC with realistic distractors.
// Dollar signs are written as words to prevent LaTeX mis-parsing.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_TEST_1_QUESTIONS: PracticeQuestion[] = [
  // ── Reading & Writing ─────────────────────────────────────────────────────
  {
    id: 'mt1-rw-01',
    section: 'Reading & Writing',
    topic: 'Words in Context',
    difficulty: 'Easy',
    prompt:
      'The general store was essential to daily life in the rural United States during the 1800s because it provided the supplies that the people living in nearby communities needed. Also, the store was a _______ of information. People socializing at the general store would share news and help spread it throughout their communities.\n\nWhich choice completes the text with the most logical and precise word or phrase?',
    choices: ['source', 'rival', 'condition', 'waste'],
    correctIndex: 0,
    explanation: 'The store served as a place from which information spread — making it a "source" of information.',
  },
  {
    id: 'mt1-rw-02',
    section: 'Reading & Writing',
    topic: 'Words in Context',
    difficulty: 'Easy',
    prompt:
      'For painter Jacob Lawrence, being _______ was an important part of the artistic process. Because he paid close attention to all the details of his Harlem neighborhood, Lawrence\'s artwork captured nuances in the beauty and vitality of the Black experience during the Harlem Renaissance and the Great Migration.\n\nWhich choice completes the text with the most logical and precise word or phrase?',
    choices: ['skeptical', 'observant', 'critical', 'confident'],
    correctIndex: 1,
    explanation: 'Paying "close attention to all the details" describes someone who is "observant."',
  },
  {
    id: 'mt1-rw-03',
    section: 'Reading & Writing',
    topic: 'Words in Context',
    difficulty: 'Easy',
    prompt:
      'Former astronaut Ellen Ochoa says that although she doesn\'t have a definite idea of when it might happen, she _______ that humans will someday need to be able to live in other environments than those found on Earth. This conjecture informs her interest in future research missions to the moon.\n\nWhich choice completes the text with the most logical and precise word or phrase?',
    choices: ['demands', 'speculates', 'doubts', 'establishes'],
    correctIndex: 1,
    explanation: 'The word "conjecture" in the next sentence signals a guess or hypothesis, matching "speculates."',
  },
  {
    id: 'mt1-rw-04',
    section: 'Reading & Writing',
    topic: 'Words in Context',
    difficulty: 'Easy',
    prompt:
      'The parasitic dodder plant increases its reproductive success by flowering at the same time as the host plant it has latched onto. In 2020, Jianqiang Wu and his colleagues determined that the tiny dodder achieves this _______ with its host by absorbing and utilizing a protein the host produces when it is about to flower.\n\nWhich choice completes the text with the most logical and precise word or phrase?',
    choices: ['synchronization', 'hibernation', 'prediction', 'moderation'],
    correctIndex: 0,
    explanation: '"Flowering at the same time" is a form of timing coordination, which is "synchronization."',
  },
  {
    id: 'mt1-rw-05',
    section: 'Reading & Writing',
    topic: 'Main Idea & Purpose',
    difficulty: 'Easy',
    prompt:
      'Jazz tap is a dance form that was first developed in African American communities. Jazz tap was heavily influenced by jazz music, which became widely popular in the United States in the 1920s. Tap dancers were inspired by jazz music\'s quick rhythms and by the way jazz musicians would make up melodies as they played. As jazz music continued to develop in the 1930s and 1940s, jazz tap evolved with it. Because of jazz music\'s influence, jazz tap quickly developed into a dance form that was very different from earlier kinds of tap dance.\n\nWhich choice best states the main purpose of the text?',
    choices: [
      'It explains why audiences prefer some kinds of music over others.',
      'It discusses the development of a dance form.',
      'It describes how to play a musical instrument.',
      'It emphasizes the popularity of a famous dancer.',
    ],
    correctIndex: 1,
    explanation: 'The passage traces how jazz tap evolved alongside jazz music — its main purpose is to discuss the development of this dance form.',
  },
  {
    id: 'mt1-rw-06',
    section: 'Reading & Writing',
    topic: 'Text Structure & Function',
    difficulty: 'Medium',
    prompt:
      'The following text is adapted from Zora Neale Hurston\'s 1921 short story "John Redding Goes to Sea." John is a child who lives in a town in the woods.\n\nPerhaps ten-year-old John was puzzling to the folk there in the Florida woods for he was an imaginative child and fond of day-dreams. The St. John River flowed a scarce three hundred feet from his back door. On its banks at this point grow numerous palms, luxuriant magnolias and bay trees. On the bosom of the stream float millions of delicately colored hyacinths. He loved to wander down to the water\'s edge, and, casting in dry twigs, watch them sail away downstream to Jacksonville, the sea, the wide world and he wanted to follow them.\n\nWhich choice best describes the function of the underlined sentence in the text as a whole?',
    choices: [
      'It provides an extended description of a location that John likes to visit.',
      'It reveals that some residents of John\'s town are confused by his behavior.',
      'It illustrates the uniqueness of John\'s imagination compared to the imaginations of other children.',
      'It suggests that John longs to experience a larger life outside the Florida woods.',
    ],
    correctIndex: 3,
    explanation: 'Watching twigs sail away and wanting to follow them shows John\'s longing for a wider world beyond his surroundings.',
  },
  {
    id: 'mt1-rw-07',
    section: 'Reading & Writing',
    topic: 'Literary Analysis',
    difficulty: 'Medium',
    prompt:
      'The following text is adapted from Oscar Wilde\'s 1891 novel The Picture of Dorian Gray. Dorian Gray is taking his first look at a portrait that Hallward has painted of him.\n\nDorian passed listlessly in front of his picture and turned towards it. When he saw it he drew back, and his cheeks flushed for a moment with pleasure. A look of joy came into his eyes, as if he had recognized himself for the first time. He stood there motionless and in wonder, dimly conscious that Hallward was speaking to him, but not catching the meaning of his words. The sense of his own beauty came on him like a revelation. He had never felt it before.\n\nAccording to the text, what is true about Dorian?',
    choices: [
      'He wants to know Hallward\'s opinion of the portrait.',
      'He is delighted by what he sees in the portrait.',
      'He prefers portraits to other types of paintings.',
      'He is uncertain of Hallward\'s talent as an artist.',
    ],
    correctIndex: 1,
    explanation: 'His flushed cheeks, joy, and sense of revelation all indicate delight at seeing his own beauty in the portrait.',
  },
  {
    id: 'mt1-rw-08',
    section: 'Reading & Writing',
    topic: 'Command of Evidence',
    difficulty: 'Medium',
    prompt:
      'The novelist Toni Morrison was the first Black woman to work as an editor at the publishing company Random House, from 1967 to 1983. A scholar asserts that one of Morrison\'s likely aims during her time as an editor was to strengthen the presence of Black writers on the list of Random House\'s published authors.\n\nWhich finding, if true, would most strongly support the scholar\'s claim?',
    choices: [
      'The percentage of authors published by Random House who were Black rose in the early 1970s and stabilized throughout the decade.',
      'Black authors who were interviewed in the 1980s and 1990s were highly likely to cite Toni Morrison\'s novels as a principal influence on their work.',
      'The novels written by Toni Morrison that were published after 1983 sold significantly more copies than the novels she wrote before 1983.',
      'Works that were edited by Toni Morrison during her time at Random House displayed stylistic characteristics that distinguished them from works not edited by Morrison.',
    ],
    correctIndex: 0,
    explanation: 'A rise in Black-authored publications at Random House during Morrison\'s tenure directly supports the claim that she worked to strengthen their presence.',
  },
  {
    id: 'mt1-rw-09',
    section: 'Reading & Writing',
    topic: 'Transitions',
    difficulty: 'Easy',
    prompt:
      'Euphorbia esula (leafy spurge) is a Eurasian plant that has become invasive in North America, where it displaces native vegetation and sickens cattle. E. esula can be controlled with chemical herbicides, but that approach can also kill harmless plants nearby. Recent research on introducing engineered DNA into plant species to inhibit their reproduction may offer a path toward exclusively targeting E. esula, consequently _______\n\nWhich choice most logically completes the text?',
    choices: [
      'making individual E. esula plants more susceptible to existing chemical herbicides.',
      'enhancing the ecological benefits of E. esula in North America.',
      'enabling cattle to consume E. esula without becoming sick.',
      'reducing invasive E. esula numbers without harming other organisms.',
    ],
    correctIndex: 3,
    explanation: '"Exclusively targeting" the invasive plant without harming others logically results in reducing its numbers without harming other organisms.',
  },
  {
    id: 'mt1-rw-10',
    section: 'Reading & Writing',
    topic: 'Inference',
    difficulty: 'Medium',
    prompt:
      'A team of biologists led by Jae-Hoon Jung, Antonio D. Barbosa, and Stephanie Hutin investigated the mechanism that allows Arabidopsis thaliana (thale cress) plants to accelerate flowering at high temperatures. They replaced the protein ELF3 in the plants with a similar protein found in another species (stiff brome) that, unlike A. thaliana, displays no acceleration in flowering with increased temperature. A comparison of unmodified A. thaliana plants with the altered plants showed no difference in flowering at 22 degrees Celsius, but at 27 degrees Celsius, the unmodified plants exhibited accelerated flowering while the altered ones did not, which suggests that _______\n\nWhich choice most logically completes the text?',
    choices: [
      'temperature-sensitive accelerated flowering is unique to A. thaliana.',
      'A. thaliana increases ELF3 production as temperatures rise.',
      'ELF3 enables A. thaliana to respond to increased temperatures.',
      'temperatures of at least 22 degrees Celsius are required for A. thaliana to flower.',
    ],
    correctIndex: 2,
    explanation: 'Because replacing ELF3 eliminated temperature-sensitive flowering, ELF3 is the protein that enables A. thaliana to respond to higher temperatures.',
  },

  // ── Math ──────────────────────────────────────────────────────────────────
  {
    id: 'mt1-m-01',
    section: 'Math',
    topic: 'Linear Functions',
    difficulty: 'Easy',
    prompt:
      's = 40 + 3t\n\nThe equation gives the speed s, in miles per hour, of a certain car t seconds after it began to accelerate. What is the speed, in miles per hour, of the car 5 seconds after it began to accelerate?',
    choices: ['40', '43', '45', '55'],
    correctIndex: 3,
    explanation: 's = 40 + 3(5) = 40 + 15 = 55 miles per hour.',
  },
  {
    id: 'mt1-m-02',
    section: 'Math',
    topic: 'Functions',
    difficulty: 'Easy',
    prompt:
      'The function f is defined by f(x) = x^2 + x + 71. What is the value of f(2)?',
    choices: ['73', '75', '77', '79'],
    correctIndex: 2,
    explanation: 'f(2) = 4 + 2 + 71 = 77.',
  },
  {
    id: 'mt1-m-03',
    section: 'Math',
    topic: 'Word Problems',
    difficulty: 'Easy',
    prompt:
      'An event planner is planning a party. It costs the event planner a one-time fee of 35 dollars to rent the venue and 10.25 dollars per attendee. The event planner has a budget of 300 dollars. What is the greatest number of attendees possible without exceeding the budget?',
    choices: ['23', '24', '25', '26'],
    correctIndex: 2,
    explanation: '10.25n + 35 ≤ 300 → 10.25n ≤ 265 → n ≤ 25.85, so the greatest whole number is 25.',
  },
  {
    id: 'mt1-m-04',
    section: 'Math',
    topic: 'Functions & Interpretation',
    difficulty: 'Easy',
    prompt:
      'The function f(w) = 6w^2 gives the area of a rectangle, in square feet, if its width is w ft and its length is 6 times its width. Which of the following is the best interpretation of f(14) = 1,176?',
    choices: [
      'If the width of the rectangle is 14 ft, then the area of the rectangle is 1,176 sq ft.',
      'If the width of the rectangle is 14 ft, then the length of the rectangle is 1,176 ft.',
      'If the width of the rectangle is 1,176 ft, then the length of the rectangle is 14 ft.',
      'If the width of the rectangle is 1,176 ft, then the area of the rectangle is 14 sq ft.',
    ],
    correctIndex: 0,
    explanation: 'f(w) gives area when width is w, so f(14) = 1,176 means a width of 14 ft gives an area of 1,176 sq ft.',
  },
  {
    id: 'mt1-m-05',
    section: 'Math',
    topic: 'Exponential Functions',
    difficulty: 'Medium',
    prompt:
      'The number of bacteria in a liquid medium doubles every day. There are 44,000 bacteria in the liquid medium at the start of an observation. Which of the following represents the number of bacteria, y, in the liquid medium t days after the start of the observation?',
    choices: ['y = (1/2)(44,000)^t', 'y = 2(44,000)^t', 'y = 44,000(1/2)^t', 'y = 44,000(2)^t'],
    correctIndex: 3,
    explanation: 'Starting at 44,000 and doubling each day gives y = 44,000 · 2^t.',
  },
  {
    id: 'mt1-m-06',
    section: 'Math',
    topic: 'Geometry — Triangles',
    difficulty: 'Medium',
    prompt:
      'Triangles ABC and DEF are congruent, where A corresponds to D, and B and E are right angles. The measure of angle A is 18 degrees. What is the measure of angle F?',
    choices: ['18°', '72°', '90°', '162°'],
    correctIndex: 1,
    explanation: 'In triangle ABC, angles sum to 180°. Angle B = 90°, angle A = 18°, so angle C = 72°. Since A↔D, B↔E, C↔F, angle F = angle C = 72°.',
  },
  {
    id: 'mt1-m-07',
    section: 'Math',
    topic: 'Algebra',
    difficulty: 'Easy',
    prompt:
      'If 4x + 2 = 12, what is the value of 16x + 8?',
    choices: ['40', '48', '56', '60'],
    correctIndex: 1,
    explanation: '16x + 8 = 4(4x + 2) = 4(12) = 48.',
  },
  {
    id: 'mt1-m-08',
    section: 'Math',
    topic: 'Geometry — Scale',
    difficulty: 'Medium',
    prompt:
      'The floor of a ballroom has an area of 600 square meters. An architect creates a scale model of the floor where the length of each side of the model is 1/10 times the length of the corresponding side of the actual floor. What is the area, in square meters, of the scale model?',
    choices: ['6', '10', '60', '150'],
    correctIndex: 0,
    explanation: 'Scaling lengths by 1/10 scales areas by (1/10)^2 = 1/100. Area = 600/100 = 6 square meters.',
  },
  {
    id: 'mt1-m-09',
    section: 'Math',
    topic: 'Percentages',
    difficulty: 'Medium',
    prompt:
      'The result of increasing the quantity x by 1,800% is 684. What is the value of x?',
    choices: ['12,996', '12,312', '38', '36'],
    correctIndex: 3,
    explanation: 'Increasing by 1,800% means multiplying by 1 + 18 = 19. So 19x = 684, giving x = 36.',
  },
  {
    id: 'mt1-m-10',
    section: 'Math',
    topic: 'Linear Functions',
    difficulty: 'Medium',
    prompt:
      'A window repair specialist charges 220 dollars for the first two hours of repair plus an hourly fee for each additional hour. The total cost for 5 hours of repair is 400 dollars. Which function f gives the total cost, in dollars, for x hours of repair, where x is greater than or equal to 2?',
    choices: ['f(x) = 60x + 100', 'f(x) = 60x + 220', 'f(x) = 80x', 'f(x) = 60(x − 2) + 220'],
    correctIndex: 3,
    explanation: 'Total cost = 220 + hourly_rate × (x − 2). From the 5-hour data: 220 + 3r = 400 → r = 60. So f(x) = 60(x − 2) + 220.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Mock Test 2 — SAT Practice Test 11
// 10 Reading & Writing + 10 Math, sourced directly from the official CSV.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_TEST_2_QUESTIONS: PracticeQuestion[] = [
  // ── Reading & Writing ─────────────────────────────────────────────────────
  {
    id: 'mt2-rw-01',
    section: 'Reading & Writing',
    topic: 'Words in Context',
    difficulty: 'Easy',
    prompt:
      'Ezra Pound\'s poetry can be hard to _______ : it is dense, experimental, and so full of references and allusions that many readers have a difficult time even identifying the poems\' subjects.\n\nWhich choice completes the text with the most logical and precise word or phrase?',
    choices: ['comprehend', 'dislike', 'interrupt', 'overlook'],
    correctIndex: 0,
    explanation: 'Dense, experimental poetry full of allusions is difficult to understand — "comprehend" fits precisely.',
  },
  {
    id: 'mt2-rw-02',
    section: 'Reading & Writing',
    topic: 'Words in Context',
    difficulty: 'Easy',
    prompt:
      'The unique subak water management system used to irrigate the rice paddy fields of the Indonesian island of Bali has a rich cultural, philosophical, and historical significance dating back to the ninth century. The many elements of subak — terraces, canals, and water temples — are _______ : they are joined together into a single cohesive unit.\n\nWhich choice completes the text with the most logical and precise word or phrase?',
    choices: ['outmoded', 'informal', 'interconnected', 'optional'],
    correctIndex: 2,
    explanation: '"Joined together into a single cohesive unit" defines elements that are "interconnected."',
  },
  {
    id: 'mt2-rw-03',
    section: 'Reading & Writing',
    topic: 'Words in Context',
    difficulty: 'Easy',
    prompt:
      'Although the government of the Soviet Union attempted to _______ Georgi Vladimov\'s novel Faithful Ruslan, copies of the book circulated in secret among readers in several parts of the country.\n\nWhich choice completes the text with the most logical and precise word or phrase?',
    choices: ['replicate', 'critique', 'import', 'suppress'],
    correctIndex: 3,
    explanation: 'The books circulating "in secret" contrasts with the government\'s attempt to stop it — "suppress" fits.',
  },
  {
    id: 'mt2-rw-04',
    section: 'Reading & Writing',
    topic: 'Words in Context',
    difficulty: 'Easy',
    prompt:
      'Scholars long thought that the initial spread of silk beyond China occurred in the second century CE, but this view has been _______ by new archaeological evidence from South Asia that reveals that the people of the Indus Civilization made use of silk at least 1,000 years earlier.\n\nWhich choice completes the text with the most logical and precise word or phrase?',
    choices: ['investigated', 'misinterpreted', 'anticipated', 'contradicted'],
    correctIndex: 3,
    explanation: 'Evidence showing silk use 1,000 years earlier than believed directly contradicts the old view.',
  },
  {
    id: 'mt2-rw-05',
    section: 'Reading & Writing',
    topic: 'Words in Context',
    difficulty: 'Easy',
    prompt:
      'A casual description of Scherezade García\'s 2019 mural Blame It on the Bean: The Power of Coffee can make the work seem _______ — a painting that is housed in a coffee shop and that depicts three women drinking coffee may not sound particularly ambitious — but in fact the work is a complex, dynamic meditation on gender and the legacy of colonialism that demands serious attention.\n\nWhich choice completes the text with the most logical and precise word or phrase?',
    choices: ['unassuming', 'shrewd', 'incongruous', 'pretentious'],
    correctIndex: 0,
    explanation: 'The contrast between a simple-sounding description and the work\'s true complexity suggests it seems "unassuming" at first.',
  },
  {
    id: 'mt2-rw-06',
    section: 'Reading & Writing',
    topic: 'Text Structure & Function',
    difficulty: 'Medium',
    prompt:
      'The following text is adapted from Akwaeke Emezi\'s 2019 novel Pet.\n\nBitter finished the painting in the dark morning of a day — it was well past midnight when Jam heard the studio door creak open. She stared into the velvet black of her room and listened to her mother\'s footsteps walking in her and Aloe\'s bedroom. There was a weight thrumming through the floorboards in a low song, and that was how Jam knew the painting was done. Bitter\'s feet were singing the news.\n\nWhich choice best states the function of the underlined sentence in the text as a whole?',
    choices: [
      'It indicates that Jam is more interested in music than in art.',
      'It adds to the idea that Bitter\'s footsteps reveal something to Jam.',
      'It indicates that Bitter always sings when working on a painting.',
      'It describes Aloe\'s reaction upon seeing the painting for the first time.',
    ],
    correctIndex: 1,
    explanation: 'The metaphor of feet "singing the news" reinforces that Bitter\'s footsteps communicated the painting\'s completion to Jam.',
  },
  {
    id: 'mt2-rw-07',
    section: 'Reading & Writing',
    topic: 'Main Idea & Purpose',
    difficulty: 'Medium',
    prompt:
      'The following text is from Bram Stoker\'s 1911 novel The Lair of the White Worm.\n\nThe meeting so auspiciously begun proceeded well. Adam, seeing that the old man was interested in the novelty of the ship, suggested that he should stay the night on board, and that he would himself be ready to start at any hour and go anywhere that the other suggested. This affectionate willingness to fall in with his own plans quite won the old man\'s heart. He warmly accepted the invitation, and at once they became not only on terms of affectionate relationship, but almost like old friends.\n\nWhich choice best states the main purpose of the text?',
    choices: [
      'It states the reasons why Adam and his great-uncle Richard decide to sleep on the ship rather than finding lodging on land.',
      'It showcases how Adam\'s flexibility and consideration strengthen his relationship with his great-uncle Richard.',
      'It describes why Adam and his great-uncle Richard are excited for their upcoming journey on the ship.',
      'It contrasts great-uncle Richard\'s wary first impressions of Adam with his ultimate affection toward him.',
    ],
    correctIndex: 1,
    explanation: 'Adam\'s willingness to accommodate his great-uncle wins the old man over — the passage shows how Adam\'s flexibility strengthens their bond.',
  },
  {
    id: 'mt2-rw-08',
    section: 'Reading & Writing',
    topic: 'Dual Texts',
    difficulty: 'Hard',
    prompt:
      'Text 1\nGood art often challenges and disrupts social and aesthetic norms, but the creation of public art — paintings, sculptures, and performance pieces displayed in nonmuseum public settings — typically requires broad agreement among artists, civic officials, and community members about the works\' message and artistic goals. Public art that fails to appease everyone by being sufficiently aesthetically and conceptually bland almost inevitably provokes backlash.\n\nText 2\nPublic art is commonly displayed in spaces intended for purposes other than meaningful aesthetic engagement. Some critics of public art therefore note that norm-defying pieces that aren\'t effectively integrated within their surroundings in a manner that primes passersby to appreciate the pieces\' merits tend to be regarded more unfavorably than similarly provocative art encountered in museums is.\n\nBased on the texts, how would the critics mentioned in Text 2 most likely respond to the underlined claim in Text 1?',
    choices: [
      'By arguing that the reason members of the general public might disagree about a public artwork\'s merits is unrelated to the unconventionality of its appearance and ideas',
      'By agreeing that only works of art that are universally appealing are suitable for displaying in public spaces',
      'By disputing the notion that civic leaders and community members are easily placated by art that reinforces social norms',
      'By contending that the kinds of reactions controversial public artworks often receive aren\'t exclusively the result of attributes inherent in the works themselves',
    ],
    correctIndex: 3,
    explanation: 'Text 2\'s critics argue that backlash depends on how art is integrated into its setting, not just on the art\'s inherent qualities — so reactions aren\'t solely due to the works\' own attributes.',
  },
  {
    id: 'mt2-rw-09',
    section: 'Reading & Writing',
    topic: 'Command of Evidence',
    difficulty: 'Medium',
    prompt:
      'The average age at which people in the United States start businesses is 35. Economist Andrés Hincapié studied why young adults are relatively less likely to start businesses and whether there are ways to increase entrepreneurship in early adulthood. Hincapié found that one impediment is lack of knowledge about the practical details of how businesses are started; he further found that simply providing young adults with good informational resources on the topic significantly alleviates this problem.\n\nBased on the text, what would Hincapié most likely say is a promising way to increase entrepreneurship in early adulthood?',
    choices: [
      'Creating social networks of young adults who are interested in starting a business',
      'Encouraging young adults to brainstorm business ideas',
      'Providing young adults with practical information about how to start a business',
      'Giving young adults training opportunities at a variety of businesses',
    ],
    correctIndex: 2,
    explanation: 'Hincapié found that providing informational resources significantly alleviates the knowledge gap — so providing practical information is the most promising solution.',
  },
  {
    id: 'mt2-rw-10',
    section: 'Reading & Writing',
    topic: 'Main Idea',
    difficulty: 'Easy',
    prompt:
      'Few animals are known to spit: among them are humans, cobras, and camels. But in January 2022 at a nature preserve in southern England, bird-watcher Clare Jacobs observed a gray seal spitting a jet of water at a white-tailed eagle flying overhead. Seals had never been seen spitting before. Biologist Sean Twiss, who studies gray seals, believes that the seal may have been attempting to scare the eagle away from a food source or that the seal may have just been playing.\n\nWhich choice best states the main idea of the text?',
    choices: [
      'Cobras are the most well-known animals that spit.',
      'Biologist Sean Twiss has studied gray seals for many years.',
      'A gray seal was observed spitting for the first time, and scientists are uncertain why.',
      'Eagles and seals are natural enemies in nature preserves.',
    ],
    correctIndex: 2,
    explanation: 'The passage centers on the unprecedented observation of a seal spitting and the uncertainty about why it happened.',
  },

  // ── Math ──────────────────────────────────────────────────────────────────
  {
    id: 'mt2-m-01',
    section: 'Math',
    topic: 'Geometry — Triangles',
    difficulty: 'Easy',
    prompt:
      'In the triangle shown, PQ / QR = 1. The triangle has angle measures that sum to 180 degrees, and two sides are equal (PQ = QR). One base angle is labeled x degrees. What is the value of x?',
    choices: ['156', '66', '48', '24'],
    correctIndex: 3,
    explanation: 'If PQ = QR the triangle is isosceles. The apex angle is 180 − 2x. Setting the sum equal to 180 and solving with the given proportion gives x = 24.',
  },
  {
    id: 'mt2-m-02',
    section: 'Math',
    topic: 'Statistics — Probability',
    difficulty: 'Easy',
    prompt:
      'A total of 50 children attended a summer camp and were offered 4 types of sandwiches. Turkey: 15, Chicken: 23, Ham: 3, Vegetarian: 9. If one of these children is selected at random, what is the probability of selecting a child who chose a vegetarian sandwich?',
    choices: ['9/100', '9/50', '1/4', '9/10'],
    correctIndex: 1,
    explanation: '9 out of 50 children chose vegetarian, so the probability is 9/50.',
  },
  {
    id: 'mt2-m-03',
    section: 'Math',
    topic: 'Word Problems',
    difficulty: 'Easy',
    prompt:
      'Amara grows cherry tomatoes in her backyard. This year, she harvested 750 cherry tomatoes and gave 10% of them to her neighbor. How many of the harvested cherry tomatoes did Amara give to her neighbor?',
    choices: ['7', '75', '750', '7,500'],
    correctIndex: 1,
    explanation: '10% of 750 = 0.10 × 750 = 75.',
  },
  {
    id: 'mt2-m-04',
    section: 'Math',
    topic: 'Systems of Equations',
    difficulty: 'Easy',
    prompt:
      'x + y = 125\nx + y + y = 155\n\nThe solution to the given system of equations is (x, y). What is the value of y?',
    choices: ['10', '20', '30', '40'],
    correctIndex: 2,
    explanation: 'The second equation simplifies to x + 2y = 155. Subtracting the first: y = 30.',
  },
  {
    id: 'mt2-m-05',
    section: 'Math',
    topic: 'Sampling & Estimation',
    difficulty: 'Medium',
    prompt:
      'A cable provider wanted to know how many of its 30,000 customers would be interested in a new service plan. The provider selected 300 customers at random and asked each whether they would be interested in the new plan. Of those surveyed, 8 said they would be interested. Which of the following is the best estimate of the total number of customers who would be interested in the new service plan?',
    choices: ['8', '80', '800', '8,000'],
    correctIndex: 2,
    explanation: '8/300 × 30,000 = 800. The estimated total is 800 customers.',
  },
  {
    id: 'mt2-m-06',
    section: 'Math',
    topic: 'Statistics',
    difficulty: 'Medium',
    prompt:
      'A scientist measured the lengths of 240 gray seals from Muskeget Island and 120 gray seals from Sable Island. The mean length of the 240 seals from Muskeget Island was 88 inches and the mean length of the 120 seals from Sable Island was 94 inches. What was the mean length, in inches, of all 360 gray seals?',
    choices: ['89', '90', '91', '92'],
    correctIndex: 1,
    explanation: 'Weighted mean = (240 × 88 + 120 × 94) / 360 = (21,120 + 11,280) / 360 = 32,400 / 360 = 90.',
  },
  {
    id: 'mt2-m-07',
    section: 'Math',
    topic: 'Geometry — Parallel Lines',
    difficulty: 'Easy',
    prompt:
      'Line k is defined by y = 6x + 4. Line j is parallel to line k in the xy-plane and passes through the point (0, 5). Which equation defines line j?',
    choices: ['y = 6x + 5', 'y = −5x + 5', 'y = −6x + 5', 'y = 5x + 5'],
    correctIndex: 0,
    explanation: 'Parallel lines have the same slope. Line k has slope 6 and line j passes through (0, 5), giving y = 6x + 5.',
  },
  {
    id: 'mt2-m-08',
    section: 'Math',
    topic: 'Geometry — Triangles',
    difficulty: 'Medium',
    prompt:
      'In triangle XYZ, the measure of angle X is 90 degrees. Point W lies on segment YZ, and segment WX is perpendicular to segment YZ. The length of segment WY is 572, and the length of segment WX is 429. What is the value of tan(Z)?',
    choices: ['5/3', '4/3', '5/4', '3/4'],
    correctIndex: 3,
    explanation: 'In right triangle WXZ, tan(Z) = WX / WZ. Using similar triangles: WZ = WX^2 / WY = 429^2 / 572 = 321.75 ≈ 1287/4. tan(Z) = WX/WZ = 3/4.',
  },
  {
    id: 'mt2-m-09',
    section: 'Math',
    topic: 'Rectangles',
    difficulty: 'Easy',
    prompt:
      'A rectangle has a length of 56 inches and a width of 28 inches. What is the area, in square inches, of the rectangle?',
    choices: ['28', '84', '168', '1,568'],
    correctIndex: 3,
    explanation: 'Area = length × width = 56 × 28 = 1,568 square inches.',
  },
  {
    id: 'mt2-m-10',
    section: 'Math',
    topic: 'Percentage Word Problems',
    difficulty: 'Medium',
    prompt:
      'The number a is 55% less than the number b. The number b is 320% greater than 160. What is the value of a?',
    choices: ['151.2', '201.6', '302.4', '672'],
    correctIndex: 2,
    explanation: 'b = 160 × (1 + 3.20) = 160 × 4.20 = 672. a = 672 × (1 − 0.55) = 672 × 0.45 = 302.4.',
  },
]

export interface MockTest {
  id: string
  name: string
  questions: PracticeQuestion[]
}

/**
 * Returns the two static mock tests built from the official SAT question bank CSVs.
 * Test 1 uses SAT Practice Test 10 questions; Test 2 uses SAT Practice Test 11 questions.
 * Questions are interleaved Math / Reading & Writing the way a real SAT alternates content.
 */
export function buildMockTests(): MockTest[] {
  function interleave(qs: PracticeQuestion[]): PracticeQuestion[] {
    const math = qs.filter((q) => q.section === 'Math')
    const rw = qs.filter((q) => q.section === 'Reading & Writing')
    const out: PracticeQuestion[] = []
    const max = Math.max(math.length, rw.length)
    for (let i = 0; i < max; i++) {
      if (rw[i]) out.push(rw[i])
      if (math[i]) out.push(math[i])
    }
    return out
  }

  return [
    {
      id: 'mock-test-1',
      name: 'Practice Test 1',
      questions: interleave(MOCK_TEST_1_QUESTIONS),
    },
    {
      id: 'mock-test-2',
      name: 'Practice Test 2',
      questions: interleave(MOCK_TEST_2_QUESTIONS),
    },
  ]
}
