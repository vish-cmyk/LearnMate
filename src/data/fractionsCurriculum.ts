import { FractionQuestion } from '../types';

export interface FractionTopicDefinition {
  id: string;
  order: number;
  title: string;
  description: string;
  keyRule: string;
  workedExample: {
    question: string;
    steps: string[];
    answer: string;
  };
  visualType: 'bar' | 'circle' | 'comparison';
}

export const FRACTION_TOPICS: FractionTopicDefinition[] = [
  {
    id: 'numerators-denominators',
    order: 1,
    title: 'Numerators & Denominators',
    description: 'Understand the parts of a fraction: numerator (parts counted) over denominator (total equal parts in a whole).',
    keyRule: 'Fraction = (Parts we have) / (Total equal parts in the whole)',
    workedExample: {
      question: 'A Whittaker’s chocolate block is split into 6 equal rows. You eat 2 rows. What fraction did you eat?',
      steps: [
        'Identify the whole: 6 equal rows in total, so the denominator = 6.',
        'Identify the parts eaten: 2 rows, so the numerator = 2.',
        'Assemble the fraction: 2/6 (which is also 1/3 when simplified).',
      ],
      answer: '2/6 (or 1/3)',
    },
    visualType: 'bar',
  },
  {
    id: 'equivalent-fractions',
    order: 2,
    title: 'Equivalent Fractions',
    description: 'Fractions that have different numbers but represent the exact same value or amount of a whole.',
    keyRule: 'Multiply or divide both numerator and denominator by the same non-zero number.',
    workedExample: {
      question: 'Find an equivalent fraction for 3/4 with a denominator of 12.',
      steps: [
        'Notice how the denominator changes: from 4 to 12 is multiplying by 3 (4 × 3 = 12).',
        'Multiply the numerator by the same multiplier: 3 × 3 = 9.',
        'Result: 3/4 is equivalent to 9/12.',
      ],
      answer: '9/12',
    },
    visualType: 'comparison',
  },
  {
    id: 'simplifying-fractions',
    order: 3,
    title: 'Simplifying Fractions',
    description: 'Write a fraction in its simplest form (lowest terms) by dividing top and bottom by their Highest Common Factor (HCF).',
    keyRule: 'Divide numerator and denominator by their Highest Common Factor until no common factors remain (except 1).',
    workedExample: {
      question: 'Simplify 12/18 to its simplest form.',
      steps: [
        'List factors of 12: 1, 2, 3, 4, 6, 12.',
        'List factors of 18: 1, 2, 3, 6, 9, 18.',
        'Highest Common Factor (HCF) is 6.',
        'Divide top and bottom by 6: 12 ÷ 6 = 2, and 18 ÷ 6 = 3.',
        'Simplest form = 2/3.',
      ],
      answer: '2/3',
    },
    visualType: 'bar',
  },
  {
    id: 'comparing-fractions',
    order: 4,
    title: 'Comparing Fractions',
    description: 'Determine which fraction is greater, smaller, or if they are equal using common denominators or visual benchmarks.',
    keyRule: 'Convert to a common denominator first, then compare numerators.',
    workedExample: {
      question: 'Which is larger: 2/3 or 3/5?',
      steps: [
        'Find a common denominator for 3 and 5: Lowest Common Multiple is 15.',
        'Convert 2/3: (2 × 5) / (3 × 5) = 10/15.',
        'Convert 3/5: (3 × 3) / (5 × 3) = 9/15.',
        'Compare numerators: 10/15 > 9/15, so 2/3 is larger than 3/5.',
      ],
      answer: '2/3 is larger',
    },
    visualType: 'comparison',
  },
  {
    id: 'adding-subtracting',
    order: 5,
    title: 'Adding & Subtracting Fractions',
    description: 'Add or subtract parts of a whole with like and unlike denominators.',
    keyRule: 'Never add denominators! If denominators are equal, add numerators. If unlike, find a common denominator first.',
    workedExample: {
      question: 'Calculate 1/4 + 2/4, then calculate 1/3 + 1/6.',
      steps: [
        'For 1/4 + 2/4: Denominators are the same (4). Keep the denominator and add tops: (1 + 2)/4 = 3/4.',
        'For 1/3 + 1/6: Denominators are different. Convert 1/3 to sixths: (1 × 2)/(3 × 2) = 2/6.',
        'Now add: 2/6 + 1/6 = 3/6, which simplifies to 1/2.',
      ],
      answer: '3/4 and 1/2',
    },
    visualType: 'circle',
  },
  {
    id: 'multiplying-dividing',
    order: 6,
    title: 'Multiplying & Dividing Fractions',
    description: 'Multiply straight across (top × top, bottom × bottom). Divide by multiplying by the reciprocal (flip the second fraction).',
    keyRule: 'Multiply: (a/b) × (c/d) = (a×c)/(b×d). Divide: Keep, Change, Flip! (a/b) ÷ (c/d) = (a/b) × (d/c).',
    workedExample: {
      question: 'Calculate (2/3) × (3/5) and (3/4) ÷ (1/2).',
      steps: [
        'Multiplication: (2 × 3) / (3 × 5) = 6/15, which simplifies to 2/5.',
        'Division: Keep 3/4, Change ÷ to ×, Flip 1/2 to 2/1.',
        '(3/4) × (2/1) = 6/4 = 3/2 (or 1 1/2).',
      ],
      answer: '2/5 and 3/2 (or 1 1/2)',
    },
    visualType: 'bar',
  },
  {
    id: 'practical-word-problems',
    order: 7,
    title: 'Practical Word Problems',
    description: 'Apply fraction understanding to real-life NZ scenarios like recipes, building, pocket money, and sports distances.',
    keyRule: 'Read carefully, identify what fraction represents the whole, convert words into mathematical operations.',
    workedExample: {
      question: 'A Year 9 school camp group walks 3/5 of a 15 km bush track on Day 1. How many kilometres did they walk?',
      steps: [
        'The question asks for 3/5 of 15 km.',
        '"Of" in mathematics means multiplication: (3/5) × 15.',
        'Calculate 1/5 of 15 km: 15 ÷ 5 = 3 km.',
        'Multiply by 3 parts: 3 × 3 = 9 km.',
      ],
      answer: '9 km',
    },
    visualType: 'bar',
  },
];

// Student-Facing Question Bank (Zero answer keys or correctness flags exposed)
export const FRACTIONS_QUESTION_BANK: FractionQuestion[] = [
  // --- DIAGNOSTIC QUESTIONS (Used to baseline the student) ---
  {
    id: 'diag-1',
    topicId: 'numerators-denominators',
    topicTitle: 'Understanding Numerators and Denominators',
    stage: 'diagnostic',
    difficulty: 'intro',
    prompt: 'A pizza is cut into 8 equal slices. Moana eats 3 slices. What fraction of the pizza did Moana eat?',
    mathExpression: 'What fraction has numerator 3 and denominator 8?',
    questionType: 'fraction_input',
    hints: [
      'Think about which number represents the total slices (bottom/denominator).',
      'The number of slices Moana ate is the top number (numerator).',
    ],
    visualModel: {
      type: 'circle',
      numerator: 3,
      denominator: 8,
      unitLabel: 'slices eaten',
    },
  },
  {
    id: 'diag-2',
    topicId: 'equivalent-fractions',
    topicTitle: 'Equivalent Fractions',
    stage: 'diagnostic',
    difficulty: 'standard',
    prompt: 'Fill in the missing numerator to make these fractions equivalent: 2/5 = ?/15',
    mathExpression: '\\frac{2}{5} = \\frac{?}{15}',
    questionType: 'fraction_input',
    hints: [
      'Look at the bottom numbers: what did 5 get multiplied by to reach 15?',
      'Multiply the top number (2) by that same multiplier!',
    ],
    visualModel: {
      type: 'comparison',
      numerator: 2,
      denominator: 5,
      secondNumerator: 6,
      secondDenominator: 15,
    },
  },
  {
    id: 'diag-3',
    topicId: 'adding-subtracting',
    topicTitle: 'Adding Fractions',
    stage: 'diagnostic',
    difficulty: 'standard',
    prompt: 'What is 1/4 + 2/4 in simplest form?',
    mathExpression: '\\frac{1}{4} + \\frac{2}{4} = ?',
    questionType: 'fraction_input',
    hints: [
      'The denominators are already identical (both are 4).',
      'Remember: do not add the denominators together! Keep the bottom number 4 and add the tops.',
    ],
    visualModel: {
      type: 'bar',
      numerator: 3,
      denominator: 4,
    },
  },

  // --- TOPIC 1: NUMERATORS & DENOMINATORS ---
  {
    id: 'prac-num-1',
    topicId: 'numerators-denominators',
    topicTitle: 'Understanding Numerators and Denominators',
    stage: 'guided_practice',
    difficulty: 'intro',
    prompt: 'In the fraction 5/12, which number is the denominator, and what does it tell us?',
    questionType: 'multiple_choice',
    options: [
      { label: '5; it tells us how many parts are shaded or selected.', value: 'A' },
      { label: '12; it tells us the total number of equal parts in the whole.', value: 'B' },
      { label: '12; it tells us the number of parts left over.', value: 'C' },
      { label: '5; it tells us the whole unit value.', value: 'D' },
    ],
    hints: ['Denominator sounds like "down" (the bottom number).'],
  },
  {
    id: 'prac-num-2',
    topicId: 'numerators-denominators',
    topicTitle: 'Understanding Numerators and Denominators',
    stage: 'guided_practice',
    difficulty: 'standard',
    prompt: 'A science lab has 20 test tubes. 7 of them contain acidic solution. What fraction of the test tubes contain acid?',
    questionType: 'fraction_input',
    hints: ['Place the counted tubes on top and total tubes on the bottom.'],
    visualModel: {
      type: 'bar',
      numerator: 7,
      denominator: 20,
    },
  },
  {
    id: 'prac-num-whittakers',
    topicId: 'numerators-denominators',
    topicTitle: 'Understanding Numerators and Denominators',
    stage: 'guided_practice',
    difficulty: 'intro',
    prompt: 'A Whittaker’s chocolate block has 6 equal rows. If you eat 2 rows, what fraction of the chocolate block did you eat?',
    mathExpression: '\\frac{2}{6} \\text{ (or } \\frac{1}{3}\\text{)}',
    questionType: 'fraction_input',
    hints: [
      'Total rows in the whole block goes at the bottom (denominator = 6).',
      'Rows eaten goes at the top (numerator = 2).',
    ],
    visualModel: {
      type: 'bar',
      numerator: 2,
      denominator: 6,
      unitLabel: 'rows of chocolate eaten',
    },
  },

  // --- TOPIC 2: EQUIVALENT FRACTIONS ---
  {
    id: 'prac-equiv-1',
    topicId: 'equivalent-fractions',
    topicTitle: 'Equivalent Fractions',
    stage: 'guided_practice',
    difficulty: 'standard',
    prompt: 'Which of the following is equivalent to 3/4?',
    questionType: 'multiple_choice',
    options: [
      { label: '6/10', value: 'A' },
      { label: '9/12', value: 'B' },
      { label: '7/8', value: 'C' },
      { label: '12/15', value: 'D' },
    ],
    hints: ['Check if multiplying top and bottom of 3/4 by the same whole number gives any option.'],
    visualModel: {
      type: 'comparison',
      numerator: 3,
      denominator: 4,
      secondNumerator: 9,
      secondDenominator: 12,
    },
  },
  {
    id: 'prac-equiv-2',
    topicId: 'equivalent-fractions',
    topicTitle: 'Equivalent Fractions',
    stage: 'guided_practice',
    difficulty: 'challenge',
    prompt: 'Find the equivalent fraction for 4/7 with a denominator of 35.',
    questionType: 'fraction_input',
    hints: [
      'What times 7 gives 35? (7 × 5 = 35).',
      'Now multiply the numerator 4 by 5 as well.',
    ],
  },
  {
    id: 'prac-equiv-challenge',
    topicId: 'equivalent-fractions',
    topicTitle: 'Equivalent Fractions',
    stage: 'guided_practice',
    difficulty: 'challenge',
    prompt: 'Challenge Problem: Find an equivalent fraction for 5/9 that has a denominator of 72.',
    mathExpression: '\\frac{5}{9} = \\frac{?}{72}',
    questionType: 'fraction_input',
    hints: [
      'What times 9 gives 72? (9 × 8 = 72).',
      'Multiply the top number 5 by 8 as well: 5 × 8 = 40.',
    ],
  },

  // --- TOPIC 3: SIMPLIFYING FRACTIONS ---
  {
    id: 'prac-simp-1',
    topicId: 'simplifying-fractions',
    topicTitle: 'Simplifying Fractions',
    stage: 'guided_practice',
    difficulty: 'standard',
    prompt: 'Simplify 8/24 to its simplest form.',
    questionType: 'fraction_input',
    hints: [
      'What is the highest number that divides evenly into both 8 and 24?',
      'Try dividing top and bottom by 8.',
    ],
    visualModel: {
      type: 'bar',
      numerator: 1,
      denominator: 3,
    },
  },
  {
    id: 'prac-simp-2',
    topicId: 'simplifying-fractions',
    topicTitle: 'Simplifying Fractions',
    stage: 'guided_practice',
    difficulty: 'challenge',
    prompt: 'Simplify 36/48 to its lowest terms.',
    questionType: 'fraction_input',
    hints: [
      'Both 36 and 48 are in the 12 times table!',
      '36 ÷ 12 = ? and 48 ÷ 12 = ?',
    ],
  },

  // --- TOPIC 4: COMPARING FRACTIONS ---
  {
    id: 'prac-comp-1',
    topicId: 'comparing-fractions',
    topicTitle: 'Comparing Fractions',
    stage: 'guided_practice',
    difficulty: 'standard',
    prompt: 'Which fraction is larger: 3/5 or 5/8? Type the larger fraction.',
    questionType: 'fraction_input',
    hints: [
      'Find a common denominator for 5 and 8 (40).',
      '3/5 = 24/40, and 5/8 = 25/40.',
      'Now compare 24/40 vs 25/40.',
    ],
    visualModel: {
      type: 'comparison',
      numerator: 3,
      denominator: 5,
      secondNumerator: 5,
      secondDenominator: 8,
    },
  },

  // --- TOPIC 5: ADDING & SUBTRACTING FRACTIONS ---
  {
    id: 'prac-add-1',
    topicId: 'adding-subtracting',
    topicTitle: 'Adding & Subtracting Fractions',
    stage: 'guided_practice',
    difficulty: 'intro',
    prompt: 'Calculate 2/7 + 3/7.',
    mathExpression: '\\frac{2}{7} + \\frac{3}{7} = ?',
    questionType: 'fraction_input',
    hints: [
      'The denominators are already identical (7).',
      'Add the numerators together and keep the denominator.',
    ],
    visualModel: {
      type: 'bar',
      numerator: 5,
      denominator: 7,
    },
  },
  {
    id: 'prac-add-remedial-visual',
    topicId: 'adding-subtracting',
    topicTitle: 'Adding & Subtracting Fractions',
    stage: 'guided_practice',
    difficulty: 'intro',
    prompt: 'Visual Model Follow-Up: Using the interactive fraction bar below, calculate 1/5 + 2/5 (remember the denominator stays 5!).',
    mathExpression: '\\frac{1}{5} + \\frac{2}{5} = ?',
    questionType: 'fraction_input',
    hints: [
      'The pieces are fifths. 1 fifth plus 2 fifths gives 3 fifths.',
      'Keep the denominator 5 untouched and add 1 + 2 = 3.',
    ],
    visualModel: {
      type: 'bar',
      numerator: 3,
      denominator: 5,
      unitLabel: 'fifths combined',
    },
  },
  {
    id: 'prac-add-2',
    topicId: 'adding-subtracting',
    topicTitle: 'Adding & Subtracting Fractions',
    stage: 'guided_practice',
    difficulty: 'standard',
    prompt: 'Calculate 1/3 + 1/6. Write your answer in simplest form.',
    mathExpression: '\\frac{1}{3} + \\frac{1}{6} = ?',
    questionType: 'fraction_input',
    hints: [
      'Denominators are different (3 and 6). Convert 1/3 into sixths first.',
      '1/3 = 2/6. Now add 2/6 + 1/6.',
      'Remember to simplify your answer!',
    ],
    visualModel: {
      type: 'circle',
      numerator: 3,
      denominator: 6,
    },
  },
  {
    id: 'prac-sub-1',
    topicId: 'adding-subtracting',
    topicTitle: 'Adding & Subtracting Fractions',
    stage: 'guided_practice',
    difficulty: 'standard',
    prompt: 'Calculate 5/8 - 1/4. Give your answer in simplest form.',
    mathExpression: '\\frac{5}{8} - \\frac{1}{4} = ?',
    questionType: 'fraction_input',
    hints: [
      'Convert 1/4 into eighths: 1/4 = 2/8.',
      'Now subtract: 5/8 - 2/8.',
    ],
  },

  // --- TOPIC 6: MULTIPLYING & DIVIDING FRACTIONS ---
  {
    id: 'prac-mult-1',
    topicId: 'multiplying-dividing',
    topicTitle: 'Multiplying & Dividing Fractions',
    stage: 'guided_practice',
    difficulty: 'standard',
    prompt: 'Calculate (2/3) × (3/4). Write in simplest form.',
    mathExpression: '\\frac{2}{3} \\times \\frac{3}{4} = ?',
    questionType: 'fraction_input',
    hints: [
      'Multiply the numerators: 2 × 3 = 6.',
      'Multiply the denominators: 3 × 4 = 12.',
      'Simplify 6/12.',
    ],
    visualModel: {
      type: 'bar',
      numerator: 1,
      denominator: 2,
    },
  },
  {
    id: 'prac-div-1',
    topicId: 'multiplying-dividing',
    topicTitle: 'Multiplying & Dividing Fractions',
    stage: 'guided_practice',
    difficulty: 'challenge',
    prompt: 'Calculate (3/4) ÷ (2/3). Give your answer as an improper fraction or mixed number.',
    mathExpression: '\\frac{3}{4} \\div \\frac{2}{3} = ?',
    questionType: 'fraction_input',
    hints: [
      'Remember "Keep, Change, Flip!": Keep 3/4, Change ÷ to ×, Flip 2/3 to 3/2.',
      'Now multiply (3/4) × (3/2).',
    ],
  },

  // --- TOPIC 7: PRACTICAL WORD PROBLEMS ---
  {
    id: 'prac-word-1',
    topicId: 'practical-word-problems',
    topicTitle: 'Practical Word Problems',
    stage: 'guided_practice',
    difficulty: 'standard',
    prompt: 'Liam has $40 of birthday money. He spends 2/5 of it on a new rugby mouthguard. How much money did he spend?',
    questionType: 'fraction_input',
    hints: [
      'First, find 1/5 of $40 by dividing 40 by 5.',
      '40 ÷ 5 = $8.',
      'Now multiply by 2 for 2/5.',
    ],
    visualModel: {
      type: 'bar',
      numerator: 2,
      denominator: 5,
      unitLabel: 'parts spent ($16 of $40)',
    },
  },
  {
    id: 'prac-word-2',
    topicId: 'practical-word-problems',
    topicTitle: 'Practical Word Problems',
    stage: 'guided_practice',
    difficulty: 'challenge',
    prompt: 'A recipe for traditional Kiwi pavlova requires 3/4 cup of caster sugar. Aroha wants to make 1/2 of the recipe. How much sugar does she need?',
    questionType: 'fraction_input',
    hints: [
      'She needs 1/2 of 3/4 cup.',
      '"Of" means multiply: (1/2) × (3/4).',
      'Multiply numerators and multiply denominators.',
    ],
  },
  {
    id: 'prac-mult-div-challenge',
    topicId: 'practical-word-problems',
    topicTitle: 'Practical Word Problems',
    stage: 'guided_practice',
    difficulty: 'challenge',
    prompt: 'Challenge Problem: A juice jug contains 4 1/2 litres of feijoa juice. If each cup holds 3/4 of a litre, how many full cups can be poured?',
    mathExpression: '4\\frac{1}{2} \\div \\frac{3}{4} = ?',
    questionType: 'fraction_input',
    hints: [
      'Convert 4 1/2 to an improper fraction: (4 × 2 + 1)/2 = 9/2.',
      'Now divide: (9/2) ÷ (3/4). Remember Keep, Change, Flip!',
      '(9/2) × (4/3) = 36/6 = ?',
    ],
    visualModel: {
      type: 'bar',
      numerator: 6,
      denominator: 6,
      unitLabel: 'cups poured',
    },
  },

  // --- INDEPENDENT ASSESSMENT CHECKPOINT (End of lesson) ---
  {
    id: 'assess-1',
    topicId: 'simplifying-fractions',
    topicTitle: 'Simplifying Fractions',
    stage: 'independent_assessment',
    difficulty: 'standard',
    prompt: 'Assessment Q1: Simplify 15/25 to lowest terms.',
    questionType: 'fraction_input',
    hints: ['Divide top and bottom by their common factor 5.'],
  },
  {
    id: 'assess-2',
    topicId: 'adding-subtracting',
    topicTitle: 'Adding & Subtracting Fractions',
    stage: 'independent_assessment',
    difficulty: 'standard',
    prompt: 'Assessment Q2: Calculate 2/5 + 1/10. Write in simplest form.',
    questionType: 'fraction_input',
    hints: ['Convert 2/5 into tenths first: 2/5 = 4/10.'],
  },
  {
    id: 'assess-3',
    topicId: 'multiplying-dividing',
    topicTitle: 'Multiplying & Dividing Fractions',
    stage: 'independent_assessment',
    difficulty: 'challenge',
    prompt: 'Assessment Q3: Calculate (4/7) × (7/8) in simplest form.',
    questionType: 'fraction_input',
    hints: ['Multiply straight across: (4 × 7) / (7 × 8), then simplify.'],
  },
];
