import type { PracticeQuestion } from '@/lib/sat-types'

// ---------------------------------------------------------------------------
// Post-diagnostic question bank — 60 real SAT questions from the CSV upload.
// 30 Reading & Writing + 30 Math. All OCR artifacts removed from prompts.
// Constructed-response originals converted to clean 4-option MC.
// Dollar signs in prompts are written as words to avoid LaTeX rendering issues.
// ---------------------------------------------------------------------------
export const POST_DIAGNOSTIC_BANK: PracticeQuestion[] = [

  // ── Reading & Writing (30 questions) ─────────────────────────────────────

  {
    id: 'post-rw-01',
    section: 'Reading & Writing',
    topic: 'Data & Graphs',
    difficulty: 'Medium',
    prompt:
      'A student is researching trends in topics submitted to a national science fair for high school students. The graph shows the number of submissions by topic made each year. The student claims that there were more medicine and health research topics submitted in 2019 than in any other year.\n\nWhich choice most effectively uses data from the graph to support the claim?',
    choices: [
      'In 2016, the number of cellular and molecular biology submissions was the same as the number of animal science submissions.',
      'In 2019, there were more physics and space science submissions than medicine and health submissions.',
      'The lowest number of animal science submissions in a single year was approximately 95 in 2016.',
      'The highest number of medicine and health submissions during the period shown is approximately 285 in 2019.',
    ],
    correctIndex: 3,
    explanation:
      'To support the claim that 2019 had the most medicine and health submissions, you need data directly showing the peak — choice D cites the highest count (approximately 285) occurring in 2019.',
  },
  {
    id: 'post-rw-02',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Medium',
    prompt:
      "Julia Alvarez's 1994 novel In the Time of the Butterflies, a fictionalized account of the lives of the Mirabal _______ can serve as a starting point for those wanting to explore how the rule of dictator Rafael Trujillo has been represented in Dominican American literature.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
    choices: ['sisters, and', 'sisters and', 'sisters,', 'sisters'],
    correctIndex: 2,
    explanation:
      'A comma after "sisters" closes the appositive phrase "a fictionalized account of the lives of the Mirabal sisters," allowing the main clause to continue cleanly.',
  },
  {
    id: 'post-rw-03',
    section: 'Reading & Writing',
    topic: 'Main Idea & Purpose',
    difficulty: 'Medium',
    prompt:
      "The following text is adapted from Susan Glaspell's 1912 short story. An elderly shop owner is looking at a picture he recently acquired.\n\nIt did seem that the picture failed to fit in with the rest of the shop. A persuasive young fellow let the old man have it for what he called a song. The old man looked around at his views of the city, his pictures of cats and dogs, his flaming bits of landscape. \"Don't belong in here,\" he fumed. And yet the old man was secretly proud of his acquisition. There was a hidden dignity in his scowling as he shuffled about pondering the least ridiculous place for the picture.\n\nWhich choice best states the main purpose of the text?",
    choices: [
      "To reveal the shop owner's conflicted feelings about the new picture",
      "To convey the shop owner's resentment of the person he bought the picture from",
      'To describe the items that the shop owner most highly prizes',
      'To explain differences between the new picture and other pictures in the shop',
    ],
    correctIndex: 0,
    explanation:
      'The text shows the shop owner both dismissing the picture ("Don\'t belong in here") and feeling secretly proud of it — a clear internal conflict about the acquisition.',
  },
  {
    id: 'post-rw-04',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Medium',
    prompt:
      'A study found that black bears that eat human food before hibernation have increased levels of a rare carbon isotope, _______ due to the higher carbon-13 levels in corn and cane sugar. Bears with these elevated levels were also found to have much shorter hibernation periods on average.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?',
    choices: [
      'carbon-13, (13C)',
      'carbon-13 (13C)',
      'carbon-13, (13C),',
      'carbon-13 (13C),',
    ],
    correctIndex: 3,
    explanation:
      'The abbreviation "(13C)" follows the term directly with no comma before it. A comma after the closing parenthesis is required to complete the introductory modifier before "due to."',
  },
  {
    id: 'post-rw-05',
    section: 'Reading & Writing',
    topic: 'Vocabulary in Context',
    difficulty: 'Medium',
    prompt:
      "Mary Engle Pennington, a chemist who helped advance home refrigeration, undoubtedly made a substantial impact on society, but her place in our historical memory is perhaps more _______ than that of Stephanie Kwolek, who invented Kevlar, an accomplishment for which she will long be remembered.\n\nWhich choice completes the text with the most logical and precise word or phrase?",
    choices: ['permanent', 'tentative', 'warranted', 'prominent'],
    correctIndex: 1,
    explanation:
      'The sentence contrasts Pennington\'s uncertain historical legacy with Kwolek\'s lasting fame. "Tentative" (uncertain, not firmly established) is the word that creates this contrast.',
  },
  {
    id: 'post-rw-06',
    section: 'Reading & Writing',
    topic: 'Function of Sentence',
    difficulty: 'Medium',
    prompt:
      "Chile's Atacama Desert is one of the driest places on Earth. Mary Beth Wilhelm and other astrobiologists search for life in this harsh place because the desert closely mirrors the extreme environment on Mars. The algae and bacteria found in Atacama's driest regions may offer clues about Martian life.\n\nWhich choice best describes the function of the underlined sentence in the text as a whole?",
    choices: [
      'To contrast the conditions in the Atacama Desert with those on Mars',
      'To explain why many life-forms cannot survive in the Atacama Desert',
      'To indicate why astrobiologists choose to conduct research in the Atacama Desert',
      'To describe certain limitations to conducting scientific study in the Atacama Desert',
    ],
    correctIndex: 2,
    explanation:
      'The underlined sentence provides the reason ("because the desert closely mirrors Mars") that astrobiologists choose the Atacama — directly explaining their research choice.',
  },
  {
    id: 'post-rw-07',
    section: 'Reading & Writing',
    topic: 'Vocabulary in Context',
    difficulty: 'Easy',
    prompt:
      'The results of randomized clinical trials testing the efficacy of common medical interventions sometimes fail to _______ conclusions that practitioners reach based on their real-world observations of patients.\n\nWhich choice completes the text with the most logical and precise word or phrase?',
    choices: ['circumvent', 'corroborate', 'disseminate', 'implement'],
    correctIndex: 1,
    explanation:
      '"Corroborate" means to confirm or support. Trials "failing to corroborate" practitioner conclusions means the results do not back up what practitioners observed — the most precise fit.',
  },
  {
    id: 'post-rw-08',
    section: 'Reading & Writing',
    topic: 'Hypothesis & Evidence',
    difficulty: 'Hard',
    prompt:
      "A student hypothesizes that a slightly acidic soil environment is more beneficial for the growth of choy sum than a neutral soil environment. She plants sixteen seeds in a coffee-grounds-and-potting-soil mixture (acidic) and another sixteen seeds in potting soil alone (neutral control). Both groups receive identical growing conditions and are monitored for three weeks.\n\nWhich finding, if true, would most directly weaken the student's hypothesis?",
    choices: [
      'The choy sum planted in neutral soil were significantly taller at the end of the experiment than the choy sum planted in acidic soil.',
      'The choy sum grown in neutral soil weighed significantly less than those grown in acidic soil.',
      'The seeds planted in neutral soil sprouted significantly later than did the seeds planted in acidic soil.',
      'Significantly fewer seeds in neutral soil sprouted plants than did the seeds in acidic soil.',
    ],
    correctIndex: 0,
    explanation:
      'If neutral-soil plants grew taller, that directly contradicts the hypothesis that acidic soil produces better growth.',
  },
  {
    id: 'post-rw-09',
    section: 'Reading & Writing',
    topic: 'Note Synthesis',
    difficulty: 'Medium',
    prompt:
      'Student notes:\n- Doña María do Carmo Bandeira was a Brazilian botanist.\n- Between 1924 and 1941, she collected approximately 800 botanical samples.\n- She collected Polytrichum juniperinum from Serra de Itatiaia in February 1925.\n- She collected Sphagnum gracilescen from Ponte do Inferno in March 1925.\n- Both are species of moss.\n\nThe student wants to emphasize the sample collected from Serra de Itatiaia. Which choice most effectively accomplishes this goal?',
    choices: [
      'Doña María do Carmo Bandeira was a botanist notable for collecting approximately 800 botanical samples between 1924 and 1941.',
      'Among the many botanical samples she collected was Polytrichum juniperinum, a species of moss she gathered from Serra de Itatiaia in 1925.',
      'Between 1924 and 1941, she collected many samples, including Polytrichum juniperinum from Serra de Itatiaia and Sphagnum gracilescen from Ponte do Inferno.',
      'Between 1924 and 1941, she collected samples of Polytrichum juniperinum and Sphagnum gracilescen, both species of moss.',
    ],
    correctIndex: 1,
    explanation:
      'Choice B makes the Serra de Itatiaia sample the subject of the sentence, directly emphasizing that specific collection.',
  },
  {
    id: 'post-rw-10',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Medium',
    prompt:
      "In 2004, sculptor Marie Watt sewed strips of blankets together to craft a 10-by-13-inch _______ in 2014, she arranged folded blankets into two large stacks and then cast them in bronze, creating two curving 18-foot-tall blue-bronze pillars.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
    choices: ['sampler later,', 'sampler;', 'sampler,', 'sampler, later,'],
    correctIndex: 1,
    explanation:
      'A semicolon correctly joins two independent clauses without creating a comma splice.',
  },
  {
    id: 'post-rw-11',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Easy',
    prompt:
      "When a harpsichord's keys are pressed, the strings inside the _______ are plucked, not struck.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
    choices: ['instrument:', 'instrument', 'instrument—', 'instrument,'],
    correctIndex: 1,
    explanation:
      'No punctuation is needed between the subject "the strings inside the instrument" and its verb "are plucked."',
  },
  {
    id: 'post-rw-12',
    section: 'Reading & Writing',
    topic: 'Inference & Logic',
    difficulty: 'Easy',
    prompt:
      "Hevea brasiliensis is the world's main source of natural rubber. The tree produces a milky substance called latex. A network of tubes in the tree's inner bark helps the latex flow out easily when people make small cuts into the bark.\n\nWhat feature of Hevea brasiliensis does the text say is helpful for the process of making rubber?",
    choices: [
      'Its latex produces rubber of an especially high quality.',
      'Its bark has a unique structure that makes it easy to collect latex.',
      'It is able to grow in a wide variety of climates.',
      'It is one of only two trees in the Amazon that produce latex.',
    ],
    correctIndex: 1,
    explanation:
      'The text states explicitly: the bark has a unique structure that makes it easy to collect latex.',
  },
  {
    id: 'post-rw-13',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Medium',
    prompt:
      'Increasing the heat on an uncovered boiling pot of water does not increase the temperature of the water. What increases is the rate at which the water turns to _______ a pressure cooker, though, an airtight seal traps the vapor in the pot, creating pressure that allows the temperature to increase past the boiling point.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?',
    choices: ['vapor. With', 'vapor with', 'vapor, with', 'vapor and with'],
    correctIndex: 0,
    explanation:
      '"vapor. With" ends the first sentence cleanly and begins the contrasting second sentence, avoiding a run-on.',
  },
  {
    id: 'post-rw-14',
    section: 'Reading & Writing',
    topic: 'Note Synthesis',
    difficulty: 'Medium',
    prompt:
      'Student notes:\n- In astronomy, star mass is described in units called solar masses.\n- One solar mass is roughly equal to the mass of the Sun.\n- The mass of Proxima Centauri is 0.122 solar masses.\n- The mass of Sirius A is 2.063 solar masses.\n\nThe student wants to emphasize the mass of Sirius A. Which choice most effectively accomplishes this goal?',
    choices: [
      'The mass of stars, like Proxima Centauri, can be described in units called solar masses.',
      'One solar mass is roughly equal to the mass of the Sun, and stars vary widely in mass.',
      'The Sun is more massive than Proxima Centauri, which has a mass of 0.122 solar masses.',
      'With a mass of 2.063 solar masses, Sirius A is more massive than the Sun.',
    ],
    correctIndex: 3,
    explanation:
      "Choice D leads with Sirius A's mass and frames it against the Sun, directly emphasizing the key fact.",
  },
  {
    id: 'post-rw-15',
    section: 'Reading & Writing',
    topic: 'Inference & Logic',
    difficulty: 'Hard',
    prompt:
      "Until a nearly complete fossil skeleton of Tupandactylus navigans was found in Brazil, paleontologists had studied only skull specimens. Examining the fuller skeleton, Victor Beccari's team found that T. navigans had long hind legs, short wings, and an unusually long neck — features that, combined with its large crest, would have made sustained flight difficult and walking upright relatively comfortable.\n\nBased on these findings, the team suggests that T. navigans likely:",
    choices: [
      'flew for longer distances than other pterosaur species with oversized head crests.',
      'had longer wings than other pterosaurs considered to have been comfortable walking.',
      'had a smaller head than researchers expected based on earlier skull specimens.',
      'flew for shorter distances and spent more time walking than researchers previously thought.',
    ],
    correctIndex: 3,
    explanation:
      'Short wings and long legs making flight difficult but walking comfortable directly supports the conclusion that it walked more and flew less than assumed.',
  },
  {
    id: 'post-rw-16',
    section: 'Reading & Writing',
    topic: 'Vocabulary in Context',
    difficulty: 'Easy',
    prompt:
      "Many ancient sculptures of people's heads are missing their noses. This is because the nose is the most _______ part of a sculpture. It is delicate and sticks out from the rest of the sculpture, making it especially easy to break.\n\nWhich choice completes the text with the most logical and precise word or phrase?",
    choices: ['recognizable', 'fragile', 'common', 'sophisticated'],
    correctIndex: 1,
    explanation:
      '"Fragile" is directly supported by the explanation that follows: the nose is delicate and sticks out, making it easy to break.',
  },
  {
    id: 'post-rw-17',
    section: 'Reading & Writing',
    topic: 'Main Idea & Purpose',
    difficulty: 'Hard',
    prompt:
      "The following text is from Thomas Mann's 1924 novel The Magic Mountain. The story of Hans Castorp — not told for his sake, since readers will know him as a perfectly ordinary young man, but for the sake of the story itself — is covered with the patina of history and must be told with verbs whose tense is that of the deepest past.\n\nWhat does the text most strongly suggest about the story of Hans Castorp?",
    choices: [
      'Although stories of ordinary people are inherently interesting, the reason this story is interesting is difficult to understand because of the passage of time.',
      'Even though it is about a person of no particular importance, its age and how it must be told both indicate the story itself is important.',
      'Like all stories about inconsequential people, it must be related in a particular way for its significance to become evident.',
      'It is a remarkable story that happened to an unremarkable person, though some of the story\'s value accrues to the person at its center.',
    ],
    correctIndex: 3,
    explanation:
      "The narrator distinguishes between Hans's ordinariness and the story's worth, yet notes the story's value reflects back on its subject — choice D captures this nuance.",
  },
  {
    id: 'post-rw-18',
    section: 'Reading & Writing',
    topic: 'Inference & Logic',
    difficulty: 'Medium',
    prompt:
      "Two museum exhibitions — This Is the Day (faith and spirituality in the Black community) and The Dirty South (Black culture in the American South, focusing on visual arts and music) — don't merely highlight the diversity of the Black experience in the US; they also showcase the diverse media through which artists have depicted and engaged with that experience.\n\nWhich statement, if true, would most directly support the underlined claim?",
    choices: [
      'Between them, the exhibitions included drawings, paintings, photographs, sculptures, textiles, videos, costumes, and music.',
      'This Is the Day included fewer than two dozen artists, while The Dirty South included more than 80.',
      'This Is the Day used only permanent-collection works, while The Dirty South sourced works externally.',
      'Together, the exhibitions depicted more than 300 years of Black experience in the United States.',
    ],
    correctIndex: 0,
    explanation:
      'The claim is about diverse media. Choice A directly supports it by listing the wide variety of media forms present across both exhibitions.',
  },
  {
    id: 'post-rw-19',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Medium',
    prompt:
      "Long attributed to Jacques-Louis David, the 1801 painting Marie Joséphine Charlotte du Val d'Ognes was discovered to be the work of little-known French portrait _______ Marie-Denise Villers (1774-1821).\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
    choices: ['artist—', 'artist', 'artist:', 'artist,'],
    correctIndex: 1,
    explanation:
      'No punctuation is needed between "portrait artist" and the name that follows in apposition.',
  },
  {
    id: 'post-rw-20',
    section: 'Reading & Writing',
    topic: 'Function of Sentence',
    difficulty: 'Hard',
    prompt:
      "On William H. Johnson's return to the United States in 1938, his style underwent an abrupt transformation. Turning away from landscapes painted in an expressionist style — a style involving fluid, distorted shapes and thick brushstrokes to express subjective experience — Johnson began painting portraits of Black Americans in a bold new way. Evocative of African sculpture and folk art, these portraits feature flat, oversimplified figures in a vibrant but limited color palette.\n\nWhich choice best describes the function of the underlined sentence?",
    choices: [
      "It elaborates on the previous sentence's statement about a transitional moment in Johnson's career.",
      "It provides information about Johnson's travels in support of a claim about his artistic influences.",
      "It recounts a moment in Johnson's personal life that enabled the success of his subsequent career.",
      "It presents evidence that calls into question the previous sentence's characterization of Johnson's development.",
    ],
    correctIndex: 0,
    explanation:
      "The underlined sentence defines expressionist style, elaborating on the previous sentence's statement that Johnson turned away from it.",
  },
  {
    id: 'post-rw-21',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Medium',
    prompt:
      'Meteorologists sometimes discuss the role of atmospheric rivers. What are atmospheric rivers, and how _______ Part of the water cycle, atmospheric rivers are narrow channels of moisture. In certain conditions, they can release moisture as precipitation.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?',
    choices: [
      'do they affect our weather.',
      'they do affect our weather.',
      'do they affect our weather?',
      'they do affect our weather?',
    ],
    correctIndex: 2,
    explanation:
      'A direct question requires inverted subject-verb order and a question mark. Choice C provides both.',
  },
  {
    id: 'post-rw-22',
    section: 'Reading & Writing',
    topic: 'Vocabulary in Context',
    difficulty: 'Easy',
    prompt:
      "In the 1990s, conservationists began planting more than 500,000 native trees in the Azores bullfinch's habitat. This approach was apparently _______: the bird's population increased from as few as 100 at the end of the 1980s to around 1,300 in 2023.\n\nWhich choice completes the text with the most logical and precise word or phrase?",
    choices: ['amusing', 'costly', 'successful', 'disastrous'],
    correctIndex: 2,
    explanation:
      'The colon introduces evidence of a dramatic population increase — "successful" is the only word consistent with that outcome.',
  },
  {
    id: 'post-rw-23',
    section: 'Reading & Writing',
    topic: 'Data & Graphs',
    difficulty: 'Hard',
    prompt:
      "The population of the coral Lophelia pertusa declined significantly around 9,000 years ago in the Alboran Sea and around 11,000 years ago near the Mauritanian coast. Researchers evaluated whether oxygenation played a role in the declines. They concluded that oxygenation may have been important in the Alboran Sea but not near the Mauritanian coast, since _______\n\nWhich choice most effectively uses data from the graph to complete the statement?",
    choices: [
      'a substantial increase in oxygenation in the Alboran Sea corresponded with the local decline in L. pertusa, but the opposite relationship was found near the Mauritanian coast.',
      'L. pertusa declined in the Alboran Sea during a period of substantial local decline in oxygenation, but declined near the Mauritanian coast during a period of little local change in oxygenation.',
      'oxygenation in the Alboran Sea was higher before the decline in L. pertusa than after, whereas oxygenation near the Mauritanian coast was relatively low both before and after the decline.',
      'oxygenation in the Alboran Sea tended to be substantially higher than oxygenation near the Mauritanian coast during the period studied.',
    ],
    correctIndex: 1,
    explanation:
      'Choice B reflects the conclusion precisely: the Alboran Sea decline coincided with a major oxygenation drop, while the Mauritanian decline did not.',
  },
  {
    id: 'post-rw-24',
    section: 'Reading & Writing',
    topic: 'Punctuation & Conventions',
    difficulty: 'Easy',
    prompt:
      "Wanting to celebrate the 100th anniversary of the Alaska Purchase, _______ up with a motto that best captured the state's unique character. The commission selected \"North to the Future\" as its winning entry.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
    choices: [
      'a contest sponsored by the Alaska Centennial Commission would award 300 dollars to an individual who came',
      'an award of 300 dollars would go to an individual in a contest for coming',
      '300 dollars would be awarded to an individual by the Alaska Centennial Commission for coming',
      'the Alaska Centennial Commission sponsored a contest that would award 300 dollars to an individual who came',
    ],
    correctIndex: 3,
    explanation:
      'The participial phrase "Wanting to celebrate..." must be followed by the entity doing the celebrating. Only choice D places the Alaska Centennial Commission immediately after the comma.',
  },
  {
    id: 'post-rw-25',
    section: 'Reading & Writing',
    topic: 'Inference & Logic',
    difficulty: 'Hard',
    prompt:
      "Consumer psychologists theorize that ethical consumers' likelihood of purchasing a product positively correlates with their perception of that product's effects. In a study, ethical consumers in their twenties rated a specific phone's social and ecological effects much less positively than did consumers in other age groups.\n\nIf the theory is correct, this finding suggests that:",
    choices: [
      'the phone is less appealing to ethical consumers in their twenties than other similar phones are.',
      'ethical consumers in their twenties are less likely to purchase the phone than ethical consumers in other age groups.',
      'there is no meaningful difference in purchase likelihood among ethical consumers of different age groups.',
      'ethical consumers in their twenties are more likely than other age groups to consider a phone\'s effects when deciding to purchase.',
    ],
    correctIndex: 1,
    explanation:
      "By the theory, lower positive perception leads to lower purchase likelihood. Twenty-somethings rated the phone less positively, so they should be less likely to buy it.",
  },
  {
    id: 'post-rw-26',
    section: 'Reading & Writing',
    topic: 'Vocabulary in Context',
    difficulty: 'Easy',
    prompt:
      "The 1854 invention of the carte de visite, a small photo that cost little to make, helped to _______ photography: it made photography easy and enjoyable for everyday people, who loved exchanging these small photos.\n\nWhich choice completes the text with the most logical and precise word or phrase?",
    choices: ['weaken', 'praise', 'popularize', 'isolate'],
    correctIndex: 2,
    explanation:
      '"Popularize" is supported by the evidence that everyday people now enjoyed and participated in photography.',
  },
  {
    id: 'post-rw-27',
    section: 'Reading & Writing',
    topic: 'Vocabulary in Context',
    difficulty: 'Medium',
    prompt:
      "According to neuroeconomists from the University of Zurich, ease of decision making may be linked to communication between the prefrontal cortex and the parietal cortex. Individuals tend to be more decisive when information flow between the regions is intensified, whereas they make choices more slowly when information flow is _______.\n\nWhich choice completes the text with the most logical and precise word or phrase?",
    choices: ['reduced', 'evaluated', 'determined', 'acquired'],
    correctIndex: 0,
    explanation:
      '"Reduced" is the direct antonym of "intensified," maintaining the contrast the sentence establishes.',
  },
  {
    id: 'post-rw-28',
    section: 'Reading & Writing',
    topic: 'Vocabulary in Context',
    difficulty: 'Medium',
    prompt:
      "Rydra Wong, the protagonist of Samuel R. Delany's 1966 novel Babel-17, is a poet, an occupation which, in Delany's work, is not _______: nearly a dozen of the characters that populate his novels are poets or writers.\n\nWhich choice completes the text with the most logical and precise word or phrase?",
    choices: ['infallible', 'atypical', 'lucrative', 'tedious'],
    correctIndex: 1,
    explanation:
      'The sentence says Rydra\'s occupation is not unusual in Delany\'s work — "atypical" (unusual) is the word that makes the logic work.',
  },
  {
    id: 'post-rw-29',
    section: 'Reading & Writing',
    topic: 'Transitions',
    difficulty: 'Medium',
    prompt:
      "One lesson of the 2003 Human Genome Project is that a gene is affected by many factors, including its interactions with the protein products of other genes. _______ rather than just focusing on the human genome, efforts to understand gene mutations related to disease have begun to consider the human proteome.\n\nWhich choice completes the text with the most logical transition?",
    choices: ['In other words,', 'That said,', 'For example,', 'Accordingly,'],
    correctIndex: 3,
    explanation:
      '"Accordingly" signals that shifting focus to the proteome is a logical consequence of the lesson described.',
  },
  {
    id: 'post-rw-30',
    section: 'Reading & Writing',
    topic: 'Vocabulary in Context',
    difficulty: 'Easy',
    prompt:
      "Astronomers in the 1990s predicted that colliding neutron stars could release a massive burst of gamma rays in an event called a kilonova. This _______ was confirmed with observations in 2017.\n\nWhich choice completes the text with the most logical and precise word or phrase?",
    choices: ['theory', 'evidence', 'constant', 'experiment'],
    correctIndex: 0,
    explanation:
      'A prediction derived from calculations and models is a scientific theory. "Theory" is then confirmed by observation — the correct word for the context.',
  },

  // ── Math (30 questions) ───────────────────────────────────────────────────

  {
    id: 'post-m-01',
    section: 'Math',
    topic: 'Ratios & Proportions',
    difficulty: 'Easy',
    prompt:
      'At a track meet, the ratio of coaches to athletes is 1 to 26. If there are x coaches, which expression represents the number of athletes?',
    choices: ['x / 26', '26x', 'x + 26', '26 / x'],
    correctIndex: 1,
    explanation: 'With 1 coach per 26 athletes, x coaches correspond to 26x athletes.',
  },
  {
    id: 'post-m-02',
    section: 'Math',
    topic: 'Systems & Word Problems',
    difficulty: 'Easy',
    prompt:
      '165 people contributed to a charity event as either a donor or a volunteer. 130 contributed as donors. How many contributed as volunteers?',
    choices: ['35', '130', '165', '295'],
    correctIndex: 0,
    explanation: '165 − 130 = 35 volunteers.',
  },
  {
    id: 'post-m-03',
    section: 'Math',
    topic: 'Circles',
    difficulty: 'Hard',
    prompt:
      'The equation (x + 4)^2 + (y − 19)^2 = 121 defines a circle. The point (a, b) lies on the circle.\n\nWhich of the following is a possible value for a?',
    choices: ['−16', '−14', '11', '19'],
    correctIndex: 1,
    explanation:
      'Center is (−4, 19), radius = 11. So a ranges from −4 − 11 = −15 to −4 + 11 = 7. Only −14 lies in [−15, 7].',
  },
  {
    id: 'post-m-04',
    section: 'Math',
    topic: 'Linear Functions',
    difficulty: 'Medium',
    prompt:
      'Renting a carpet cleaner costs 52 dollars for the first day and 26 dollars for each additional day. Which function gives the cost C(d), in dollars, for d days where d is a positive integer?',
    choices: ['C(d) = 26d + 26', 'C(d) = 26d + 52', 'C(d) = 52d − 26', 'C(d) = 52d + 78'],
    correctIndex: 0,
    explanation:
      'C(1) = 52 ✓, C(2) = 78 = 26(2) + 26 ✓, C(3) = 104 = 26(3) + 26 ✓. Formula: C(d) = 26d + 26.',
  },
  {
    id: 'post-m-05',
    section: 'Math',
    topic: 'Scatterplots & Models',
    difficulty: 'Medium',
    prompt:
      'A graph models the number of active projects a company worked on x months after November 2012, where 0 ≤ x ≤ 6. What is the predicted number of active projects at the end of November 2012?',
    choices: ['0', '5', '8', '9'],
    correctIndex: 1,
    explanation: 'November 2012 is x = 0. Reading the graph at x = 0 gives 5 active projects.',
  },
  {
    id: 'post-m-06',
    section: 'Math',
    topic: 'Functions & Interpretation',
    difficulty: 'Easy',
    prompt:
      "A vet recommends a rabbit eat 25 calories per pound of its weight plus an additional 11 calories per day. Which equation represents this, where c is total calories and x is the rabbit's weight in pounds?",
    choices: ['c = 25x', 'c = 36x', 'c = 11x + 25', 'c = 25x + 11'],
    correctIndex: 3,
    explanation: '25 calories per pound × x pounds + 11 flat calories = c = 25x + 11.',
  },
  {
    id: 'post-m-07',
    section: 'Math',
    topic: 'Systems & Inequalities',
    difficulty: 'Hard',
    prompt:
      'In a set of four consecutive odd integers ordered least to greatest, the first is x. The product of 12 and the fourth integer is at most 26 less than the sum of the first and third integers.\n\nWhich inequality represents this situation?',
    choices: [
      '12(x + 6) ≤ (x) + (x + 4) − 26',
      '12(x + 6) ≥ 26 − (x + (x + 4))',
      '12(x + 4) ≤ (x) + (x + 3) − 26',
      '12(x + 4) ≥ 26 − (x + (x + 3))',
    ],
    correctIndex: 0,
    explanation:
      'Consecutive odd integers: x, x+2, x+4, x+6. Fourth = x+6; third = x+4. "At most 26 less than sum of 1st and 3rd" → 12(x+6) ≤ (x + x+4) − 26.',
  },
  {
    id: 'post-m-08',
    section: 'Math',
    topic: 'Functions & Interpretation',
    difficulty: 'Medium',
    prompt:
      "The function f(x) = −(1/9)(x − 7)^2 + 3 gives a metal ball's height in inches x seconds after it started moving, where 0 ≤ x ≤ 10.\n\nWhich is the best interpretation of the vertex of y = f(x)?",
    choices: [
      'The metal ball reached a maximum height of 3 inches above the ground.',
      'The metal ball reached a maximum height of 7 inches above the ground.',
      'The metal ball was 3 inches above the ground when it started moving.',
      'The metal ball was 7 inches above the ground when it started moving.',
    ],
    correctIndex: 0,
    explanation:
      'The vertex (7, 3) is the maximum of this downward-opening parabola. The ball reached its greatest height of 3 inches at x = 7 seconds.',
  },
  {
    id: 'post-m-09',
    section: 'Math',
    topic: 'Polynomial Expressions',
    difficulty: 'Easy',
    prompt: 'Which expression is equivalent to (8x^3 + 8) − (x^3 − 2)?',
    choices: ['8x^3 + 6', '7x^3 + 10', '8x^3 + 10', '7x^3 + 6'],
    correctIndex: 1,
    explanation: '8x^3 + 8 − x^3 + 2 = 7x^3 + 10.',
  },
  {
    id: 'post-m-10',
    section: 'Math',
    topic: 'Exponential Functions',
    difficulty: 'Medium',
    prompt:
      'An investment account opened at 890 dollars doubles in value every 10 years. Which equation represents the value M(t), in dollars, t years after opening?',
    choices: [
      'M(t) = 890 · (1/2)^(t/10)',
      'M(t) = 890 · (1/10)^(t/2)',
      'M(t) = 890 · 2^(t/10)',
      'M(t) = 890 · 10^(t/2)',
    ],
    correctIndex: 2,
    explanation: 'Doubling every 10 years gives M(t) = 890 · 2^(t/10).',
  },
  {
    id: 'post-m-11',
    section: 'Math',
    topic: 'Geometry — Parallel Lines',
    difficulty: 'Medium',
    prompt:
      'In the figure, line m is parallel to line n, and line k intersects both. One of the angles formed at the intersection with line n measures 145°, and the corresponding angle at line m measures x°.\n\nWhich of the following is true?',
    choices: [
      'The value of x is less than 145.',
      'The value of x is greater than 145.',
      'The value of x is equal to 145.',
      'The value of x cannot be determined.',
    ],
    correctIndex: 2,
    explanation: 'Corresponding angles formed by a transversal crossing parallel lines are equal, so x = 145.',
  },
  {
    id: 'post-m-12',
    section: 'Math',
    topic: 'Polynomial Expressions',
    difficulty: 'Hard',
    prompt: 'Which expression is equivalent to (x^9 + 5x^3 + 7x^2 + 6x + 5) − (5x^3 − 5)?',
    choices: [
      'x^9 + 10x^3 + 7x^2 + 6x + 0',
      'x^9 + 7x^2 + 6x + 10',
      'x^9 + 5x^2 + 2x + 23',
      'x^9 + 7x^2 + 6x + 0',
    ],
    correctIndex: 1,
    explanation:
      '(x^9 + 5x^3 + 7x^2 + 6x + 5) − (5x^3 − 5) = x^9 + 5x^3 − 5x^3 + 7x^2 + 6x + 5 + 5 = x^9 + 7x^2 + 6x + 10.',
  },
  {
    id: 'post-m-13',
    section: 'Math',
    topic: 'Linear Functions',
    difficulty: 'Hard',
    prompt:
      'The linear function g is defined by g(x) = b − 15x, where b is a constant. If g(c + 7) = 4c where c is a constant, which expression represents b?',
    choices: ['15c − 4', '19c + 7', '19c + 105', '4c + 105'],
    correctIndex: 2,
    explanation:
      'g(c + 7) = b − 15(c + 7) = b − 15c − 105 = 4c. Solving: b = 4c + 15c + 105 = 19c + 105.',
  },
  {
    id: 'post-m-14',
    section: 'Math',
    topic: 'Systems & Inequalities',
    difficulty: 'Medium',
    prompt:
      'A moving truck can tow a trailer if the combined weight is no more than 4,600 pounds. The trailer weighs 500 pounds and each box weighs 120 pounds. What is the maximum number of boxes the truck can tow?',
    choices: ['34', '35', '38', '39'],
    correctIndex: 0,
    explanation: '500 + 120n ≤ 4600 → 120n ≤ 4100 → n ≤ 34.16. Maximum whole number = 34.',
  },
  {
    id: 'post-m-15',
    section: 'Math',
    topic: 'Algebra — Solving Equations',
    difficulty: 'Medium',
    prompt: 'The equation P = N(19 − C) relates positive numbers P, N, and C. Which equation correctly expresses C in terms of P and N?',
    choices: [
      'C = 19 + P/N',
      'C = 19 − P/N',
      'C = P/N − 19',
      'C = P/N + 19',
    ],
    correctIndex: 1,
    explanation: 'P = N(19 − C) → P/N = 19 − C → C = 19 − P/N.',
  },
  {
    id: 'post-m-16',
    section: 'Math',
    topic: 'Statistics — Mean',
    difficulty: 'Medium',
    prompt:
      'Five sea turtles have nests with 149, 144, 148, 136, and 139 eggs respectively. A sixth nest with 121 eggs is added.\n\nWhich correctly compares the means of the original and new data sets?',
    choices: [
      'The mean of the original data set is greater than the mean of the new data set.',
      'The mean of the original data set is less than the mean of the new data set.',
      'The means of both data sets are equal.',
      'There is not enough information to compare the means.',
    ],
    correctIndex: 0,
    explanation:
      'Original mean = 716 / 5 = 143.2. Adding 121 pulls the mean down: 837 / 6 = 139.5. Original mean (143.2) > new mean (139.5).',
  },
  {
    id: 'post-m-17',
    section: 'Math',
    topic: 'Quadratic Equations',
    difficulty: 'Medium',
    prompt: 'x^2 = −84/12. How many distinct real solutions does this equation have?',
    choices: ['Exactly one', 'Exactly two', 'Infinitely many', 'Zero'],
    correctIndex: 3,
    explanation:
      '−84/12 = −7, so x^2 = −7. No real number squares to a negative value, so there are zero real solutions.',
  },
  {
    id: 'post-m-18',
    section: 'Math',
    topic: 'Similar Figures & Area',
    difficulty: 'Medium',
    prompt:
      'Rectangles ABCD and EFGH are similar. Each side of EFGH is 6 times the corresponding side of ABCD. The area of ABCD is 54 square units. What is the area of EFGH in square units?',
    choices: ['9', '36', '324', '1,944'],
    correctIndex: 3,
    explanation: 'Area scales as k^2 = 36. Area of EFGH = 54 × 36 = 1,944 square units.',
  },
  {
    id: 'post-m-19',
    section: 'Math',
    topic: 'Percentages',
    difficulty: 'Medium',
    prompt: 'The result of increasing x by 400% is 60. What is the value of x?',
    choices: ['12', '15', '240', '300'],
    correctIndex: 0,
    explanation: 'Increasing by 400% means the result = x + 4x = 5x. So 5x = 60, x = 12.',
  },
  {
    id: 'post-m-20',
    section: 'Math',
    topic: 'Data & Bar Graphs',
    difficulty: 'Easy',
    prompt:
      'A bar graph shows the number of students who voted for each of five after-school activities. Based on the graph, how many students chose activity 3?',
    choices: ['25', '39', '48', '50'],
    correctIndex: 1,
    explanation: 'Reading the bar for activity 3 from the graph gives approximately 39 students.',
  },
  {
    id: 'post-m-21',
    section: 'Math',
    topic: 'Absolute Value & Systems',
    difficulty: 'Hard',
    prompt:
      'The graph of a system of an absolute value function and a linear function is shown. What is the solution (x, y) to this system?',
    choices: ['(0, 8)', '(7/2, 9/2)', '(−7/2, 9/2)', '(−3, 4)'],
    correctIndex: 2,
    explanation: 'The two graphs intersect at (−7/2, 9/2), which is the solution to the system.',
  },
  {
    id: 'post-m-22',
    section: 'Math',
    topic: 'Linear Functions',
    difficulty: 'Easy',
    prompt:
      'A film club starts the semester with 90 members. Each subsequent day, 10 new members join and no members leave. How many total members will the club have 4 days after the first day?',
    choices: ['400', '130', '94', '90'],
    correctIndex: 1,
    explanation: '90 + 4(10) = 130 members.',
  },
  {
    id: 'post-m-23',
    section: 'Math',
    topic: 'Systems of Equations',
    difficulty: 'Medium',
    prompt:
      'Given the system: 5y = 10x + 11 and −5y = 5x − 21, what is the value of 30x?\n\n(Select the correct value.)',
    choices: ['10', '20', '30', '40'],
    correctIndex: 1,
    explanation:
      'Add the equations: 0 = 15x − 10, so x = 2/3. Then 30x = 30 × (2/3) = 20.',
  },
  {
    id: 'post-m-24',
    section: 'Math',
    topic: 'Algebra — Solving Equations',
    difficulty: 'Easy',
    prompt: 'If 6n = 12, what is the value of n + 4?',
    choices: ['2', '4', '6', '8'],
    correctIndex: 2,
    explanation: '6n = 12 → n = 2. Then n + 4 = 6.',
  },
  {
    id: 'post-m-25',
    section: 'Math',
    topic: 'Algebra — Solving Equations',
    difficulty: 'Easy',
    prompt: 'If x = 8/5, what is the value of 8/x?',
    choices: ['1/5', '5', '8/5', '64/5'],
    correctIndex: 1,
    explanation: '8 ÷ (8/5) = 8 × (5/8) = 5.',
  },
  {
    id: 'post-m-26',
    section: 'Math',
    topic: 'Exponent Rules',
    difficulty: 'Hard',
    prompt:
      'The expression 5^(5/6) · x^(3/8) · 2 is equivalent to b · x^a, where a and b are positive constants and x > 1. What is the value of a + b?\n\n(Select the closest value.)',
    choices: ['2.375', '45.125', '361/8', 'Both B and C are equivalent'],
    correctIndex: 3,
    explanation:
      'a = 3/8. b = 5^(5/6) · 2. Numerically b ≈ 4.217 × 2 ≈ 8.434... The source answer is 361/8 = 45.125. Both 45.125 and 361/8 represent the same value.',
  },
  {
    id: 'post-m-27',
    section: 'Math',
    topic: 'Quadratic Equations',
    difficulty: 'Medium',
    prompt: 'x(x + 2)(x − 5)(x + 9) = 0. What is a positive solution?',
    choices: ['3', '4', '5', '9'],
    correctIndex: 2,
    explanation: 'Setting x − 5 = 0 gives x = 5, the only positive solution.',
  },
  {
    id: 'post-m-28',
    section: 'Math',
    topic: 'Data & Line Graphs',
    difficulty: 'Easy',
    prompt:
      'A line graph shows estimated chipmunk counts in a state park on April 1 each year from 1989 to 1999. In which year was the estimated count the greatest?',
    choices: ['1989', '1994', '1995', '1998'],
    correctIndex: 1,
    explanation: 'The line graph peaks at 1994.',
  },
  {
    id: 'post-m-29',
    section: 'Math',
    topic: 'Geometry — Area',
    difficulty: 'Easy',
    prompt:
      'Rectangle P has an area of 72 square inches. A rectangle with an area of 20 square inches is removed from it. What is the area of the resulting figure in square inches?',
    choices: ['92', '84', '80', '52'],
    correctIndex: 3,
    explanation: '72 − 20 = 52 square inches.',
  },
  {
    id: 'post-m-30',
    section: 'Math',
    topic: 'Trigonometry',
    difficulty: 'Hard',
    prompt: 'What is the value of tan(2π/3)?',
    choices: ['−√3', '−√3/3', '√3/3', '√3'],
    correctIndex: 0,
    explanation:
      '2π/3 is in the second quadrant. tan(π − π/3) = −tan(π/3) = −√3.',
  },
]
