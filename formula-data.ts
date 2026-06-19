import type { FormulaGroup } from './sat-types'

export const FORMULA_GROUPS: FormulaGroup[] = [
  {
    category: 'Linear Equations & Lines',
    section: 'Math',
    icon: 'ti-chart-line',
    formulas: [
      {
        name: 'Slope',
        expression: 'm = \\frac{y_2 - y_1}{x_2 - x_1}',
        note: 'Rise over run between two points.',
      },
      {
        name: 'Slope-intercept form',
        expression: 'y = mx + b',
        note: 'm is slope, b is the y-intercept.',
      },
      {
        name: 'Point-slope form',
        expression: 'y - y_1 = m(x - x_1)',
        note: 'Use when you have a point and the slope.',
      },
      {
        name: 'Standard form',
        expression: 'Ax + By = C',
        note: 'Parallel lines share slope; perpendicular slopes are negative reciprocals.',
      },
    ],
  },
  {
    category: 'Quadratics & Polynomials',
    section: 'Math',
    icon: 'ti-curve',
    formulas: [
      {
        name: 'Quadratic formula',
        expression: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        note: 'Solves ax² + bx + c = 0.',
      },
      {
        name: 'Discriminant',
        expression: '\\Delta = b^2 - 4ac',
        note: '>0 two real roots, =0 one root, <0 no real roots.',
      },
      {
        name: 'Vertex form',
        expression: 'y = a(x - h)^2 + k',
        note: 'Vertex is at (h, k).',
      },
      {
        name: 'Vertex x-coordinate',
        expression: 'x = -\\frac{b}{2a}',
        note: 'Axis of symmetry of a parabola.',
      },
    ],
  },
  {
    category: 'Geometry & Measurement',
    section: 'Math',
    icon: 'ti-triangle',
    formulas: [
      {
        name: 'Area of a circle',
        expression: 'A = \\pi r^2',
        note: 'Circumference is C = 2πr.',
      },
      {
        name: 'Pythagorean theorem',
        expression: 'a^2 + b^2 = c^2',
        note: 'Right triangles only; c is the hypotenuse.',
      },
      {
        name: 'Area of a triangle',
        expression: 'A = \\frac{1}{2} b h',
        note: 'Base times height over two.',
      },
      {
        name: 'Volume of a rectangular prism',
        expression: 'V = lwh',
        note: 'Length times width times height.',
      },
      {
        name: 'Special right triangle (45-45-90)',
        expression: 'x,\\; x,\\; x\\sqrt{2}',
        note: 'Legs equal; hypotenuse is leg × √2.',
      },
      {
        name: 'Special right triangle (30-60-90)',
        expression: 'x,\\; x\\sqrt{3},\\; 2x',
        note: 'Sides opposite 30°, 60°, 90°.',
      },
    ],
  },
  {
    category: 'Trigonometry',
    section: 'Math',
    icon: 'ti-angle',
    formulas: [
      {
        name: 'Sine, cosine, tangent',
        expression: '\\sin\\theta = \\frac{opp}{hyp},\\; \\cos\\theta = \\frac{adj}{hyp},\\; \\tan\\theta = \\frac{opp}{adj}',
        note: 'Remember SOH-CAH-TOA.',
      },
      {
        name: 'Cofunction identity',
        expression: '\\sin\\theta = \\cos(90^\\circ - \\theta)',
        note: 'Sine and cosine of complementary angles are equal.',
      },
    ],
  },
  {
    category: 'Statistics & Data',
    section: 'Math',
    icon: 'ti-chart-bar',
    formulas: [
      {
        name: 'Mean (average)',
        expression: '\\bar{x} = \\frac{\\sum x}{n}',
        note: 'Sum of values divided by how many there are.',
      },
      {
        name: 'Percent change',
        expression: '\\% = \\frac{new - old}{old} \\times 100',
        note: 'Negative result means a decrease.',
      },
      {
        name: 'Probability',
        expression: 'P = \\frac{favorable}{total}',
        note: 'Always between 0 and 1.',
      },
      {
        name: 'Exponential growth',
        expression: 'y = a(1 + r)^t',
        note: 'Use (1 − r) for decay.',
      },
    ],
  },
  {
    category: 'Grammar & Punctuation',
    section: 'Reading & Writing',
    icon: 'ti-writing',
    formulas: [
      {
        name: 'Comma splice fix',
        expression: '\\text{Two clauses} \\to \\text{; or , + FANBOYS}',
        note: 'Never join two full sentences with just a comma.',
      },
      {
        name: 'Subject-verb agreement',
        expression: '\\text{Singular subject} \\to \\text{singular verb}',
        note: 'Ignore words between subject and verb.',
      },
      {
        name: 'Apostrophes',
        expression: "\\text{its} = \\text{possessive},\\; \\text{it's} = \\text{it is}",
        note: 'Possessive pronouns never take apostrophes.',
      },
      {
        name: 'Colon rule',
        expression: '\\text{Full sentence} : \\text{list or explanation}',
        note: 'What comes before a colon must stand alone.',
      },
    ],
  },
  {
    category: 'Reading Strategy',
    section: 'Reading & Writing',
    icon: 'ti-book',
    formulas: [
      {
        name: 'Evidence pairs',
        expression: '\\text{Answer} \\Leftrightarrow \\text{line reference}',
        note: 'Your answer must be provable from the text.',
      },
      {
        name: 'Transitions',
        expression: '\\text{Contrast} \\to \\text{however, but, yet}',
        note: 'Match the logical relationship between ideas.',
      },
      {
        name: 'Main idea',
        expression: '\\text{Topic} + \\text{author stance}',
        note: 'The big picture, not a single detail.',
      },
    ],
  },
]
