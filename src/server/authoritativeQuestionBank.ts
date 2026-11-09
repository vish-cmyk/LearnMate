/**
 * Authoritative Server-Side Question Bank and Answer Keys for LearnMate AI
 *
 * CRITICAL SECURITY ARCHITECTURE:
 * - This file contains authoritative correct answers, simplification keys,
 *   option correctness flags, and misconception patterns.
 * - This file MUST ONLY be imported and executed by server-side processes
 *   (server.ts, test runner, server progression engine).
 * - It is NEVER bundled or exposed to the client browser.
 */

import { AuthoritativeFractionQuestion } from '../types';

export const AUTHORITATIVE_QUESTION_BANK: AuthoritativeFractionQuestion[] = [
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
    correctAnswer: '3/8',
    hints: [
      'Think about which number represents the total slices (bottom/denominator).',
      'The number of slices Moana ate is the top number (numerator).',
    ],
    explanation: 'There are 8 equal pieces in total (denominator = 8), and 3 pieces were eaten (numerator = 3), making the fraction 3/8.',
    visualModel: {
      type: 'circle',
      numerator: 3,
      denominator: 8,
      unitLabel: 'slices eaten',
    },
    commonMisconceptions: [
      {
        pattern: '8/3',
        label: 'Numerator/Denominator Inversion',
        tutorIntervention: 'Notice that you wrote 8 on top and 3 on the bottom. The denominator on the bottom tells us the total pieces in the whole (8), while the numerator on top tells us the pieces we have (3).',
      },
      {
        pattern: '3/5',
        label: 'Part-to-Remaining Ratio Misconception',
        tutorIntervention: 'You compared the 3 eaten slices to the 5 slices left over. A fraction compares the parts eaten (3) to the TOTAL slices in the whole pizza (8).',
      },
    ],
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
    correctAnswer: '6/15',
    simplifiedAnswer: '6',
    unsimplifiedAnswer: '6/15',
    hints: [
      'Look at the bottom numbers: what did 5 get multiplied by to reach 15?',
      'Multiply the top number (2) by that same multiplier!',
    ],
    explanation: '5 × 3 = 15. To keep the value identical, multiply the top by 3 as well: 2 × 3 = 6. So 2/5 = 6/15 (or 6).',
    visualModel: {
      type: 'comparison',
      numerator: 2,
      denominator: 5,
      secondNumerator: 6,
      secondDenominator: 15,
    },
    commonMisconceptions: [
      {
        pattern: '2/15',
        label: 'Multiplier Neglect',
        tutorIntervention: 'You changed the denominator from 5 to 15, but kept the numerator as 2. To keep the fraction equal in value, both top and bottom must be multiplied by the same number!',
      },
      {
        pattern: '12/15',
        label: 'Incorrect Scale Multiplier',
        tutorIntervention: 'Check your multiplication: 5 × 3 = 15, so we need to multiply 2 by 3, which equals 6, not 12.',
      },
    ],
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
    correctAnswer: '3/4',
    hints: [
      'The denominators are already identical (both are 4).',
      'Remember: do not add the denominators together! Keep the bottom number 4 and add the tops.',
    ],
    explanation: 'Since the parts are the same size (quarters), we add 1 + 2 = 3 parts. The denominator stays 4: 3/4.',
    visualModel: {
      type: 'bar',
      numerator: 3,
      denominator: 4,
    },
    commonMisconceptions: [
      {
        pattern: '3/8',
        label: 'Denominator Addition Misconception (adding both numerators and denominators)',
        tutorIntervention: 'Notice what happened to the denominator: 4 + 4 = 8. When adding fractions that already have equal pieces, the pieces don’t get smaller! We keep the bottom number 4 and only add the tops: 1 + 2 = 3.',
      },
    ],
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
      { label: '5; it tells us how many parts are shaded or selected.', value: 'A', isCorrect: false },
      { label: '12; it tells us the total number of equal parts in the whole.', value: 'B', isCorrect: true },
      { label: '12; it tells us the number of parts left over.', value: 'C', isCorrect: false },
      { label: '5; it tells us the whole unit value.', value: 'D', isCorrect: false },
    ],
    correctAnswer: 'B',
    hints: ['Denominator sounds like "down" (the bottom number).'],
    explanation: 'The denominator is 12 (the bottom number) and specifies how many equal pieces the whole has been divided into.',
    commonMisconceptions: [
      {
        pattern: 'A',
        label: 'Numerator/Denominator Inversion',
        tutorIntervention: 'Remember that the denominator is the number DOWN at the bottom. 5 is the numerator sitting at the top.',
      },
    ],
  },
  {
    id: 'prac-num-2',
    topicId: 'numerators-denominators',
    topicTitle: 'Understanding Numerators and Denominators',
    stage: 'guided_practice',
    difficulty: 'standard',
    prompt: 'A science lab has 20 test tubes. 7 of them contain acidic solution. What fraction of the test tubes contain acid?',
    questionType: 'fraction_input',
    correctAnswer: '7/20',
    hints: ['Place the counted tubes on top and total tubes on the bottom.'],
    explanation: '7 parts out of 20 total parts gives 7/20.',
    visualModel: {
      type: 'bar',
      numerator: 7,
      denominator: 20,
    },
    commonMisconceptions: [
      {
        pattern: '7/13',
        label: 'Wins-to-Losses Ratio Confusion',
        tutorIntervention: 'You compared the 7 acid tubes to the 13 non-acid tubes. A fraction compares the selected tubes to the TOTAL tubes (20).',
      },
    ],
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
    correctAnswer: '2/6',
    simplifiedAnswer: '1/3',
    unsimplifiedAnswer: '2/6',
    hints: [
      'Total rows in the whole block goes at the bottom (denominator = 6).',
      'Rows eaten goes at the top (numerator = 2).',
    ],
    explanation: '2 rows eaten out of 6 total rows gives 2/6 (or 1/3 when simplified).',
    visualModel: {
      type: 'bar',
      numerator: 2,
      denominator: 6,
      unitLabel: 'rows of chocolate eaten',
    },
    commonMisconceptions: [
      {
        pattern: '2/4',
        label: 'Parts Eaten to Parts Remaining Error',
        tutorIntervention: 'You compared the 2 rows eaten to the 4 rows remaining. The denominator must be the total rows in the entire chocolate block (6), giving 2/6.',
      },
    ],
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
      { label: '6/10', value: 'A', isCorrect: false },
      { label: '9/12', value: 'B', isCorrect: true },
      { label: '7/8', value: 'C', isCorrect: false },
      { label: '12/15', value: 'D', isCorrect: false },
    ],
    correctAnswer: 'B',
    hints: ['Check if multiplying top and bottom of 3/4 by the same whole number gives any option.'],
    explanation: 'Multiplying both 3 and 4 by 3 gives 9/12. Thus 3/4 and 9/12 are equivalent.',
    visualModel: {
      type: 'comparison',
      numerator: 3,
      denominator: 4,
      secondNumerator: 9,
      secondDenominator: 12,
    },
    commonMisconceptions: [
      {
        pattern: 'C',
        label: 'Additive Equivalence Misconception',
        tutorIntervention: 'You might have added 4 to both top and bottom (3+4=7, 4+4=8). Fractions stay equivalent by MULTIPLYING or DIVIDING, never by adding the same number to both.',
      },
    ],
  },
  {
    id: 'prac-equiv-2',
    topicId: 'equivalent-fractions',
    topicTitle: 'Equivalent Fractions',
    stage: 'guided_practice',
    difficulty: 'challenge',
    prompt: 'Find the equivalent fraction for 4/7 with a denominator of 35.',
    questionType: 'fraction_input',
    correctAnswer: '20/35',
    unsimplifiedAnswer: '20/35',
    simplifiedAnswer: '20',
    hints: [
      'What times 7 gives 35? (7 × 5 = 35).',
      'Now multiply the numerator 4 by 5 as well.',
    ],
    explanation: 'Since 7 × 5 = 35, multiply 4 × 5 = 20. The equivalent fraction is 20/35.',
    commonMisconceptions: [
      {
        pattern: '4/35',
        label: 'Multiplier Neglect',
        tutorIntervention: 'Remember to multiply the top number as well: 4 × 5 = 20.',
      },
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
    correctAnswer: '40/72',
    unsimplifiedAnswer: '40/72',
    simplifiedAnswer: '40',
    hints: [
      'What times 9 gives 72? (9 × 8 = 72).',
      'Multiply the top number 5 by 8 as well: 5 × 8 = 40.',
    ],
    explanation: 'Multiply both numerator and denominator by 8: (5 × 8) / (9 × 8) = 40/72.',
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
    correctAnswer: '1/3',
    hints: [
      'What is the highest number that divides evenly into both 8 and 24?',
      'Try dividing top and bottom by 8.',
    ],
    explanation: 'The Highest Common Factor of 8 and 24 is 8. Dividing both gives 8 ÷ 8 = 1 and 24 ÷ 8 = 3, so 1/3.',
    visualModel: {
      type: 'bar',
      numerator: 1,
      denominator: 3,
    },
    commonMisconceptions: [
      {
        pattern: '4/12',
        label: 'Incomplete Simplification',
        tutorIntervention: 'Good start dividing by 2 to get 4/12, but 4 and 12 can be divided by 4 again to reach lowest terms (1/3).',
      },
    ],
  },
  {
    id: 'prac-simp-2',
    topicId: 'simplifying-fractions',
    topicTitle: 'Simplifying Fractions',
    stage: 'guided_practice',
    difficulty: 'challenge',
    prompt: 'Simplify 36/48 to its lowest terms.',
    questionType: 'fraction_input',
    correctAnswer: '3/4',
    hints: [
      'Both 36 and 48 are in the 12 times table!',
      '36 ÷ 12 = ? and 48 ÷ 12 = ?',
    ],
    explanation: 'Dividing both numerator and denominator by 12 yields 3/4.',
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
    correctAnswer: '5/8',
    hints: [
      'Find a common denominator for 5 and 8 (40).',
      '3/5 = 24/40, and 5/8 = 25/40.',
      'Now compare 24/40 vs 25/40.',
    ],
    explanation: 'Converting to common denominator 40: 3/5 = 24/40, while 5/8 = 25/40. Because 25 > 24, 5/8 is the larger fraction.',
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
    correctAnswer: '5/7',
    hints: [
      'The denominators are already identical (7).',
      'Add the numerators together and keep the denominator.',
    ],
    explanation: '2/7 + 3/7 = (2 + 3)/7 = 5/7.',
    visualModel: {
      type: 'bar',
      numerator: 5,
      denominator: 7,
    },
    commonMisconceptions: [
      {
        pattern: '5/14',
        label: 'Repeated Denominator Addition Misconception',
        tutorIntervention: 'Careful! You added 7 + 7 = 14 on the bottom. In fractions, when the pieces are already the same size (sevenths), the size of the piece does not change. Keep 7 at the bottom and only add 2 + 3.',
      },
    ],
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
    correctAnswer: '3/5',
    hints: [
      'The pieces are fifths. 1 fifth plus 2 fifths gives 3 fifths.',
      'Keep the denominator 5 untouched and add 1 + 2 = 3.',
    ],
    explanation: 'When adding fifths, the size of each piece remains 5. We only combine the numerators: 1/5 + 2/5 = 3/5.',
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
    correctAnswer: '1/2',
    unsimplifiedAnswer: '3/6',
    simplifiedAnswer: '1/2',
    hints: [
      'Denominators are different (3 and 6). Convert 1/3 into sixths first.',
      '1/3 = 2/6. Now add 2/6 + 1/6.',
      'Remember to simplify your answer!',
    ],
    explanation: 'Convert 1/3 to 2/6. Then 2/6 + 1/6 = 3/6. Dividing top and bottom by 3 gives 1/2.',
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
    correctAnswer: '3/8',
    hints: [
      'Convert 1/4 into eighths: 1/4 = 2/8.',
      'Now subtract: 5/8 - 2/8.',
    ],
    explanation: '1/4 is equivalent to 2/8. Subtracting gives (5 - 2)/8 = 3/8.',
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
    correctAnswer: '1/2',
    unsimplifiedAnswer: '6/12',
    simplifiedAnswer: '1/2',
    hints: [
      'Multiply the numerators: 2 × 3 = 6.',
      'Multiply the denominators: 3 × 4 = 12.',
      'Simplify 6/12.',
    ],
    explanation: '(2 × 3) / (3 × 4) = 6/12. Simplifying by dividing by 6 gives 1/2.',
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
    correctAnswer: '9/8',
    hints: [
      'Remember "Keep, Change, Flip!": Keep 3/4, Change ÷ to ×, Flip 2/3 to 3/2.',
      'Now multiply (3/4) × (3/2).',
    ],
    explanation: 'Keep 3/4, change to multiplication, flip 2/3 to 3/2: (3 × 3) / (4 × 2) = 9/8 (or 1 1/8).',
    commonMisconceptions: [
      {
        pattern: '6/12',
        label: 'Direct Division Error',
        tutorIntervention: 'Did you divide across? To divide fractions, multiply by the reciprocal (flip the second fraction upside down: 2/3 becomes 3/2).',
      },
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
    correctAnswer: '16',
    hints: [
      'First, find 1/5 of $40 by dividing 40 by 5.',
      '40 ÷ 5 = $8.',
      'Now multiply by 2 for 2/5.',
    ],
    explanation: '1/5 of $40 is $40 ÷ 5 = $8. Since he spent 2/5, we calculate 2 × $8 = $16.',
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
    correctAnswer: '3/8',
    hints: [
      'She needs 1/2 of 3/4 cup.',
      '"Of" means multiply: (1/2) × (3/4).',
      'Multiply numerators and multiply denominators.',
    ],
    explanation: '(1/2) × (3/4) = (1 × 3) / (2 × 4) = 3/8 of a cup.',
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
    correctAnswer: '6',
    hints: [
      'Convert 4 1/2 to an improper fraction: (4 × 2 + 1)/2 = 9/2.',
      'Now divide: (9/2) ÷ (3/4). Remember Keep, Change, Flip!',
      '(9/2) × (4/3) = 36/6 = ?',
    ],
    explanation: '4 1/2 = 9/2 litres. (9/2) ÷ (3/4) = (9/2) × (4/3) = 36/6 = 6 cups.',
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
    correctAnswer: '3/5',
    hints: ['Divide top and bottom by their common factor 5.'],
    explanation: '15 ÷ 5 = 3 and 25 ÷ 5 = 5, giving 3/5.',
  },
  {
    id: 'assess-2',
    topicId: 'adding-subtracting',
    topicTitle: 'Adding & Subtracting Fractions',
    stage: 'independent_assessment',
    difficulty: 'standard',
    prompt: 'Assessment Q2: Calculate 2/5 + 1/10. Write in simplest form.',
    questionType: 'fraction_input',
    correctAnswer: '1/2',
    unsimplifiedAnswer: '5/10',
    simplifiedAnswer: '1/2',
    hints: ['Convert 2/5 into tenths first: 2/5 = 4/10.'],
    explanation: '4/10 + 1/10 = 5/10 = 1/2.',
  },
  {
    id: 'assess-3',
    topicId: 'multiplying-dividing',
    topicTitle: 'Multiplying & Dividing Fractions',
    stage: 'independent_assessment',
    difficulty: 'challenge',
    prompt: 'Assessment Q3: Calculate (4/7) × (7/8) in simplest form.',
    questionType: 'fraction_input',
    correctAnswer: '1/2',
    unsimplifiedAnswer: '28/56',
    simplifiedAnswer: '1/2',
    hints: ['Multiply straight across: (4 × 7) / (7 × 8), then simplify.'],
    explanation: '28/56 simplifies directly to 1/2.',
  },
];

export const AUTHORITATIVE_QUESTION_MAP = new Map<string, AuthoritativeFractionQuestion>(
  AUTHORITATIVE_QUESTION_BANK.map((q) => [q.id, q])
);

export function getAuthoritativeQuestion(id: string): AuthoritativeFractionQuestion | undefined {
  return AUTHORITATIVE_QUESTION_MAP.get(id);
}
