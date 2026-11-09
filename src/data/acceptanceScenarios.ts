export interface AcceptanceScenarioStep {
  step: number;
  questionId: string;
  questionPrompt: string;
  studentInput: string;
  consecutiveMistakes?: number;
  conceptConsecutiveMistakes?: number;
  conceptConsecutiveCorrect?: number;
  conceptMisconceptions?: string[];
  wasRecovering?: boolean;
  description: string;
  expectedAssertion: {
    expectedAssessment: 'correct' | 'incorrect' | 'partial' | 'question';
    expectedAction: 'advance' | 'reinforce' | 'simplify' | 'hint';
    expectedMisconceptionSnippet?: string;
    requiresVisualPrompt?: boolean;
    requiresTwoConsecutiveCorrect?: boolean;
    requiresRecovery?: boolean;
    expectedCanAdvance?: boolean;
    expectedAdaptiveAction?:
      | 'standard_correct'
      | 'retry_required'
      | 'approach_shifted_new_question'
      | 'recovery_demonstrated'
      | 'challenge_escalation'
      | 'topic_advanced';
    expectedActiveQuestionAfterTurn?: string;
  };
  simulatedTutorResponse: {
    message: string;
    assessment: 'correct' | 'incorrect' | 'partial' | 'question';
    misconception: string | null;
    recommendedAction: 'advance' | 'reinforce' | 'simplify' | 'hint';
    pedagogicalExplanation: string;
  };
}

export interface AcceptanceScenario {
  id: string;
  code: 'A' | 'B' | 'C' | 'D';
  name: string;
  badge: string;
  description: string;
  expectedTutorBehavior: string;
  targetTopicId: string;
  initialQuestionId: string;
  studentSteps: AcceptanceScenarioStep[];
}

export const ACCEPTANCE_SCENARIOS: AcceptanceScenario[] = [
  {
    id: 'scenario-a',
    code: 'A',
    name: 'Consecutive Correct & Challenge Escalation',
    badge: 'Adaptive Escalation',
    targetTopicId: 'equivalent-fractions',
    initialQuestionId: 'prac-equiv-1',
    description: 'Student demonstrates two consecutive correct answers on Equivalent Fractions. Progression engine enforces adaptive question selection: it immediately escalates to a harder Challenge Question (5/9 = ?/72).',
    expectedTutorBehavior: 'Detects 2 consecutive correct responses on concept, verifies canAdvance=true, and adaptively routes the student to a harder challenge problem rather than repeating introductory drills.',
    studentSteps: [
      {
        step: 1,
        questionId: 'prac-equiv-1',
        questionPrompt: 'Which of the following is equivalent to 3/4?',
        studentInput: 'B',
        consecutiveMistakes: 0,
        conceptConsecutiveCorrect: 0,
        description: 'First correct answer on Equivalent Fractions concept (consecutiveCorrect becomes 1).',
        expectedAssertion: {
          expectedAssessment: 'correct',
          expectedAction: 'advance',
          expectedCanAdvance: true,
          expectedAdaptiveAction: 'standard_correct',
        },
        simulatedTutorResponse: {
          message: 'Ka pai! Spot on! 🎉 You chose option B (9/12). You correctly identified the mathematical multiplier 3.\n\nReady for the next question on this concept?',
          assessment: 'correct',
          misconception: null,
          recommendedAction: 'advance',
          pedagogicalExplanation: 'Tutor validates first correct answer and tracks concept momentum.',
        },
      },
      {
        step: 2,
        questionId: 'prac-equiv-2',
        questionPrompt: 'Find the equivalent fraction for 4/7 with a denominator of 35.',
        studentInput: '20/35',
        consecutiveMistakes: 0,
        conceptConsecutiveCorrect: 1,
        description: 'Second consecutive correct answer on concept (consecutiveCorrect reaches 2) -> adaptive question selection escalates to challenge.',
        expectedAssertion: {
          expectedAssessment: 'correct',
          expectedAction: 'advance',
          requiresTwoConsecutiveCorrect: true,
          expectedCanAdvance: true,
          expectedAdaptiveAction: 'challenge_escalation',
          expectedActiveQuestionAfterTurn: 'prac-equiv-challenge',
        },
        simulatedTutorResponse: {
          message: 'Ka pai! Spot on! 🎉 20/35 is correct.\n\nThat’s two consecutive correct answers on this concept! Escalating to Challenge difficulty: Find an equivalent fraction for 5/9 with a denominator of 72.',
          assessment: 'correct',
          misconception: null,
          recommendedAction: 'advance',
          pedagogicalExplanation: 'Engine detects 2 consecutive correct answers on concept and adaptively replaces standard drills with a challenge question.',
        },
      },
      {
        step: 3,
        questionId: 'prac-equiv-challenge',
        questionPrompt: 'Challenge Problem: Find an equivalent fraction for 5/9 that has a denominator of 72.',
        studentInput: '40/72',
        consecutiveMistakes: 0,
        conceptConsecutiveCorrect: 2,
        description: 'Student successfully solves the escalated challenge question (5 × 8 / 9 × 8 = 40/72). Concept confirmed mastered.',
        expectedAssertion: {
          expectedAssessment: 'correct',
          expectedAction: 'advance',
          expectedCanAdvance: true,
          expectedAdaptiveAction: 'topic_advanced',
        },
        simulatedTutorResponse: {
          message: 'Tino pai rawa atu! Flawless solution to the challenge question: 40/72 is exact! 🎉 You have demonstrated complete mastery of Equivalent Fractions.',
          assessment: 'correct',
          misconception: null,
          recommendedAction: 'advance',
          pedagogicalExplanation: 'Student solves escalated challenge question; engine marks concept as mastered with recorded evidence.',
        },
      },
    ],
  },
  {
    id: 'scenario-b',
    code: 'B',
    name: 'Difficulty, Retry Enforcement & Recovery',
    badge: 'Explanation Recovery',
    targetTopicId: 'numerators-denominators',
    initialQuestionId: 'prac-num-1',
    description: 'Student struggles with numerator/denominator roles. Progression engine strictly blocks advancement (canAdvance=false, "Understood, Next" disabled). Student receives Socratic Kiwi hint, retries, and demonstrates recovery.',
    expectedTutorBehavior: 'Enforces retry requirement after incorrect answer, prevents skipping or bypassing gaps, provides Socratic scaffolding, and clears the gap only when active answer demonstrates understanding.',
    studentSteps: [
      {
        step: 1,
        questionId: 'prac-num-1',
        questionPrompt: 'In the fraction 5/12, which number is the denominator, and what does it tell us?',
        studentInput: '5 is the denominator because it is on top',
        consecutiveMistakes: 0,
        conceptConsecutiveMistakes: 0,
        description: 'Student inverts roles. Engine records unresolved mistake and blocks progression (canAdvance=false).',
        expectedAssertion: {
          expectedAssessment: 'incorrect',
          expectedAction: 'simplify',
          expectedMisconceptionSnippet: 'Inversion',
          expectedCanAdvance: false,
          expectedAdaptiveAction: 'retry_required',
        },
        simulatedTutorResponse: {
          message: 'Kia ora! That is such a common place to mix things up when starting out, so don’t worry at all!\n\nHere is a handy memory trick that Kiwi teachers often use:\n• **D**enominator starts with **D** for **Down** (the bottom number).\n• **N**umerator is at the top (think **N**orth or **N**umber of pieces we have).\n\nTake another look: which number is sitting down at the bottom?',
          assessment: 'incorrect',
          misconception: 'Numerator/Denominator Inversion',
          recommendedAction: 'simplify',
          pedagogicalExplanation: 'Tutor provides an empathetic memory aid ("Down = Denominator"). Student cannot advance without retry.',
        },
      },
      {
        step: 2,
        questionId: 'prac-num-whittakers',
        questionPrompt: 'A Whittaker’s chocolate block has 6 equal rows. If you eat 2 rows, what fraction did you eat?',
        studentInput: 'I don’t really get how to write it',
        consecutiveMistakes: 0,
        conceptConsecutiveMistakes: 1,
        description: 'Student expresses uncertainty. Tutor provides concrete Kiwi chocolate block hint without marking wrong.',
        expectedAssertion: {
          expectedAssessment: 'question',
          expectedAction: 'hint',
          expectedCanAdvance: false,
          expectedAdaptiveAction: 'retry_required',
        },
        simulatedTutorResponse: {
          message: 'No stress at all—let’s look at the picture together step by step! 🍫\n\nImagine the chocolate block right in front of you:\n1. Total rows in the whole block = 6 (that goes down at the bottom: /6).\n2. Rows you enjoyed = 2 (that goes up on top: 2).\n\nPut them together: 2 on top of 6 is written as **2/6**. How does that feel?',
          assessment: 'question',
          misconception: null,
          recommendedAction: 'hint',
          pedagogicalExplanation: 'Tutor provides Socratic hint with concrete visual model.',
        },
      },
      {
        step: 3,
        questionId: 'prac-num-whittakers',
        questionPrompt: 'A Whittaker’s chocolate block has 6 equal rows. If you eat 2 rows, what fraction did you eat?',
        studentInput: '2/6',
        wasRecovering: true,
        conceptConsecutiveCorrect: 0,
        description: 'Student demonstrates understanding on retry. Engine clears unresolved gap (hasUnresolvedMistake=false, canAdvance=true).',
        expectedAssertion: {
          expectedAssessment: 'correct',
          expectedAction: 'advance',
          requiresRecovery: true,
          expectedCanAdvance: true,
          expectedAdaptiveAction: 'recovery_demonstrated',
        },
        simulatedTutorResponse: {
          message: 'Tino pai rawa atu! You worked through the explanation and solved it accurately: 2/6 is spot on! 🎉 You have resolved the misunderstanding and demonstrated true understanding.',
          assessment: 'correct',
          misconception: null,
          recommendedAction: 'advance',
          pedagogicalExplanation: 'Student demonstrated understanding on follow-up question; tutor validates recovery and clears gap.',
        },
      },
    ],
  },
  {
    id: 'scenario-c',
    code: 'C',
    name: 'Repeated Errors & Teaching Approach Shift',
    badge: 'Strategy Change',
    targetTopicId: 'adding-subtracting',
    initialQuestionId: 'diag-3',
    description: 'Student commits the denominator-addition misconception twice on the same concept. Engine changes explanation to visual bar model AND automatically provides a new question testing the same concept (1/5 + 2/5).',
    expectedTutorBehavior: 'Identifies 2 repeated occurrences of the denominator-addition error on the same concept, switches teaching strategy to interactive visualizer, serves a new remedial question, and verifies recovery.',
    studentSteps: [
      {
        step: 1,
        questionId: 'diag-3',
        questionPrompt: 'Calculate 1/4 + 2/4.',
        studentInput: '3/8',
        consecutiveMistakes: 0,
        conceptConsecutiveMistakes: 0,
        description: 'First occurrence of Denominator Addition error (mistakes on concept becomes 1).',
        expectedAssertion: {
          expectedAssessment: 'incorrect',
          expectedAction: 'simplify',
          expectedMisconceptionSnippet: 'Denominator Addition',
          expectedCanAdvance: false,
          expectedAdaptiveAction: 'retry_required',
        },
        simulatedTutorResponse: {
          message: 'Kia ora! I can see exactly what your brain did there: you added 1 + 2 = 3 on top, and 4 + 4 = 8 on the bottom. Almost every maths student tries that at first!\n\nLet’s picture this: imagine a large pizza cut into 4 big slices (quarters). You grab 1 slice, and your friend gives you 2 more slices.\nDo the slices magically shrink into tiny eighths? No! They are still quarters. You simply have 3 slices of size quarter: **3/4**.\n\n**Golden Rule:** When denominators are already the same, keep the bottom number untouched!',
          assessment: 'incorrect',
          misconception: 'Denominator Addition Misconception (adding both numerators and denominators)',
          recommendedAction: 'simplify',
          pedagogicalExplanation: 'Tutor pinpoints the exact mechanism of the mistake and gives a physical pizza intuition.',
        },
      },
      {
        step: 2,
        questionId: 'prac-add-1',
        questionPrompt: 'Calculate 2/7 + 3/7.',
        studentInput: '5/14',
        consecutiveMistakes: 1,
        conceptConsecutiveMistakes: 1,
        conceptMisconceptions: ['Denominator Addition Misconception (adding both numerators and denominators)'],
        description: 'Second occurrence of Denominator Addition error on same concept -> triggers approach shift and provides NEW question testing same concept.',
        expectedAssertion: {
          expectedAssessment: 'incorrect',
          expectedAction: 'simplify',
          expectedMisconceptionSnippet: 'Repeated Denominator Addition',
          requiresVisualPrompt: true,
          expectedCanAdvance: false,
          expectedAdaptiveAction: 'approach_shifted_new_question',
          expectedActiveQuestionAfterTurn: 'prac-add-remedial-visual',
        },
        simulatedTutorResponse: {
          message: 'Hold on a moment! Notice what happened again with the denominator on the bottom: this is the second time adding denominators occurred.\n\nLet\'s switch approaches completely! Step away from the calculation rule and look at the **Fraction Visualizer Bar** below:\n• When a whole bar is divided into equal chunks, the denominator tells us the size of each piece.\n• When we combine pieces of the same size, the pieces do NOT magically shrink into smaller chunks!\n• Keep the bottom number untouched and only combine the numerators on top.\n\nHere is a fresh question to practice this visual approach: Calculate 1/5 + 2/5.',
          assessment: 'incorrect',
          misconception: 'Repeated Denominator Addition Misconception',
          recommendedAction: 'simplify',
          pedagogicalExplanation: 'Same misconception occurred twice on this concept; engine shifts teaching approach to visual bar model and provides new question.',
        },
      },
      {
        step: 3,
        questionId: 'prac-add-remedial-visual',
        questionPrompt: 'Visual Model Follow-Up: Using the interactive fraction bar below, calculate 1/5 + 2/5 (remember the denominator stays 5!).',
        studentInput: '3/5',
        wasRecovering: true,
        conceptConsecutiveCorrect: 0,
        description: 'Student applies visual bar model and answers the new question correctly -> recovery verified.',
        expectedAssertion: {
          expectedAssessment: 'correct',
          expectedAction: 'advance',
          requiresRecovery: true,
          expectedCanAdvance: true,
          expectedAdaptiveAction: 'recovery_demonstrated',
        },
        simulatedTutorResponse: {
          message: 'Tino pai rawa atu! You applied the visual bar explanation and solved it accurately: 3/5 is spot on! 🎉 You have resolved the misunderstanding and demonstrated true understanding.',
          assessment: 'correct',
          misconception: null,
          recommendedAction: 'advance',
          pedagogicalExplanation: 'Student recovered and answered correctly following the visual model intervention.',
        },
      },
    ],
  },
  {
    id: 'scenario-d',
    code: 'D',
    name: 'Demonstrated Mastery & Harder Question',
    badge: 'Mastery Synthesis',
    targetTopicId: 'practical-word-problems',
    initialQuestionId: 'prac-word-1',
    description: 'Student demonstrates procedural accuracy on applied fraction problems. Progression engine verifies two consecutive correct answers, then escalates to an advanced synthesis challenge question (Feijoa juice mixed number division), validating recorded evidence of mastery.',
    expectedTutorBehavior: 'Validates accurate calculation on word problems, skips redundant basic drills, escalates to a multi-step challenge problem upon 2 consecutive correct answers on the concept, and confirms mastery in the final learning report only upon demonstrated proof.',
    studentSteps: [
      {
        step: 1,
        questionId: 'prac-word-1',
        questionPrompt: 'Liam has $40 of birthday money. He spends 2/5 of it on a new rugby mouthguard. How much money did he spend?',
        studentInput: '16',
        consecutiveMistakes: 0,
        conceptConsecutiveCorrect: 0,
        description: 'Student calculates 2/5 of $40 = $16 correctly (consecutiveCorrect becomes 1).',
        expectedAssertion: {
          expectedAssessment: 'correct',
          expectedAction: 'advance',
          expectedCanAdvance: true,
          expectedAdaptiveAction: 'standard_correct',
        },
        simulatedTutorResponse: {
          message: 'Ka pai! Spot on! 🎉 16 is correct ($16 spent). Ready for the next application problem?',
          assessment: 'correct',
          misconception: null,
          recommendedAction: 'advance',
          pedagogicalExplanation: 'Tutor validates first correct answer on word problems.',
        },
      },
      {
        step: 2,
        questionId: 'prac-word-2',
        questionPrompt: 'A recipe for traditional Kiwi pavlova requires 3/4 cup of caster sugar. Aroha wants to make 1/2 of the recipe. How much sugar does she need?',
        studentInput: '3/8',
        consecutiveMistakes: 0,
        conceptConsecutiveCorrect: 1,
        description: 'Student calculates (1/2) × (3/4) = 3/8 cup (consecutiveCorrect reaches 2 on concept) -> escalates to synthesis challenge question.',
        expectedAssertion: {
          expectedAssessment: 'correct',
          expectedAction: 'advance',
          requiresTwoConsecutiveCorrect: true,
          expectedCanAdvance: true,
          expectedAdaptiveAction: 'challenge_escalation',
          expectedActiveQuestionAfterTurn: 'prac-mult-div-challenge',
        },
        simulatedTutorResponse: {
          message: 'Outstanding work! 3/8 of a cup is exact.\n\nThat’s two in a row on applied fraction problems! Escalating to Synthesis Challenge: 4 1/2 litres of feijoa juice in 3/4 litre cups.',
          assessment: 'correct',
          misconception: null,
          recommendedAction: 'advance',
          pedagogicalExplanation: 'Engine detects 2 consecutive correct answers on concept and serves synthesis challenge.',
        },
      },
      {
        step: 3,
        questionId: 'prac-mult-div-challenge',
        questionPrompt: 'Challenge Problem: A juice jug contains 4 1/2 litres of feijoa juice. If each cup holds 3/4 of a litre, how many full cups can be poured?',
        studentInput: '6',
        consecutiveMistakes: 0,
        conceptConsecutiveCorrect: 2,
        description: 'Student solves advanced mixed number division challenge problem: 9/2 ÷ 3/4 = 6 cups. Full mastery confirmed in report.',
        expectedAssertion: {
          expectedAssessment: 'correct',
          expectedAction: 'advance',
          expectedCanAdvance: true,
          expectedAdaptiveAction: 'topic_advanced',
        },
        simulatedTutorResponse: {
          message: 'Brilliant mathematical reasoning! 4 1/2 = 9/2, and (9/2) ÷ (3/4) = 6 cups. You have achieved full mastery of Year 9 Fractions operations!',
          assessment: 'correct',
          misconception: null,
          recommendedAction: 'advance',
          pedagogicalExplanation: 'Engine confirms complete mastery with recorded evidence following successful challenge synthesis problem.',
        },
      },
    ],
  },
];
