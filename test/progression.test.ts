/**
 * LearnMate AI - Automated Adaptive Progression Engine Test Suite
 *
 * Verifies all 6 requirements specified in Section 5:
 * 1. Correct answers and increasing difficulty.
 * 2. Incorrect answers and targeted guidance (retry enforcement, no bypass).
 * 3. Repeated misconceptions and alternative explanations (strategy shift & new question).
 * 4. Recovery after an alternative explanation.
 * 5. Mastery and progression (recorded evidence required).
 * 6. Leaving a lesson without falsely recording mastery.
 * 7. Acceptance Scenarios A, B, C, D complete end-to-end runs.
 */

import { TutorProgressionEngine } from '../src/utils/tutorProgressionEngine';
import { ACCEPTANCE_SCENARIOS } from '../src/data/acceptanceScenarios';
import { FRACTIONS_QUESTION_BANK } from '../src/data/fractionsCurriculum';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const testResults: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function runTest(name: string, fn: () => void) {
  try {
    fn();
    testResults.push({ name, passed: true });
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    testResults.push({ name, passed: false, error: err.message });
    console.error(`  ✗ FAIL: ${name}\n    ${err.message}`);
  }
}

console.log('\n======================================================');
console.log('  LearnMate AI Adaptive Engine Automated Test Suite   ');
console.log('======================================================\n');

// ---------------------------------------------------------------------------
// TEST 1: Correct answers and increasing difficulty (Adaptive Question Selection)
// ---------------------------------------------------------------------------
runTest('1. Correct answers and increasing difficulty (escalates to challenge)', () => {
  const engine = new TutorProgressionEngine({
    initialTopicId: 'equivalent-fractions',
    initialQuestionId: 'prac-equiv-1',
  });

  // Step 1: First correct answer
  const step1 = engine.submitAnswer('B', 'prac-equiv-1');
  assert(step1.evalResult.isCorrect === true, 'Step 1 answer B must be correct');
  assert(step1.canAdvance === true, 'canAdvance must be true after correct answer');
  assert(step1.conceptConsecutiveCorrect === 1, 'consecutiveCorrect must be 1');
  assert(step1.adaptiveAction === 'standard_correct', 'adaptiveAction should be standard_correct');

  // Step 2: Second consecutive correct answer on this concept
  const step2 = engine.submitAnswer('20/35', 'prac-equiv-2');
  assert(step2.evalResult.isCorrect === true, 'Step 2 answer 20/35 must be correct');
  assert(step2.canAdvance === true, 'canAdvance must be true');
  assert(step2.conceptConsecutiveCorrect === 2, 'consecutiveCorrect must be 2');

  // Verify actual adaptive question escalation
  assert(
    step2.adaptiveAction === 'challenge_escalation',
    `adaptiveAction must be challenge_escalation, got ${step2.adaptiveAction}`
  );
  assert(
    step2.activeQuestionAfterTurn.difficulty === 'challenge',
    `Active question difficulty must become challenge, got ${step2.activeQuestionAfterTurn.difficulty}`
  );
  assert(
    step2.activeQuestionAfterTurn.id === 'prac-equiv-challenge',
    `Active question must be prac-equiv-challenge, got ${step2.activeQuestionAfterTurn.id}`
  );
  assert(
    engine.conceptStats['equivalent-fractions'].currentDifficultyLevel === 'challenge',
    'Concept difficulty level must be recorded as challenge'
  );

  // Step 3: Solve escalated challenge question
  const step3 = engine.submitAnswer('40/72', 'prac-equiv-challenge');
  assert(step3.evalResult.isCorrect === true, 'Challenge solution 40/72 must be correct');
  assert(step3.conceptConsecutiveCorrect === 3, 'consecutiveCorrect must be 3');
  assert(step3.evalResult.isEquivalent === true, 'Equivalent flag must be true');
});

// ---------------------------------------------------------------------------
// TEST 2: Incorrect answers and targeted guidance (Retry enforcement)
// ---------------------------------------------------------------------------
runTest('2. Incorrect answers and targeted guidance (enforces retry, blocks advance)', () => {
  const engine = new TutorProgressionEngine({
    initialTopicId: 'numerators-denominators',
    initialQuestionId: 'prac-num-1',
  });

  const step1 = engine.submitAnswer('5 is the denominator because it is on top', 'prac-num-1');
  assert(step1.evalResult.isCorrect === false, 'Answer must be evaluated as incorrect');
  assert(step1.canAdvance === false, 'canAdvance MUST be false (student cannot advance without understanding)');
  assert(step1.isRetryRequired === true, 'isRetryRequired must be true');
  assert(step1.adaptiveAction === 'retry_required', 'adaptiveAction must be retry_required');

  const concept = engine.conceptStats['numerators-denominators'];
  assert(concept.hasUnresolvedMistake === true, 'hasUnresolvedMistake must be true');
  assert(concept.status === 'needs_practice', 'Concept status must be needs_practice');
  assert(concept.consecutiveMistakes === 1, 'consecutiveMistakes must be 1');
  assert(concept.consecutiveCorrect === 0, 'consecutiveCorrect must be 0');
  assert(concept.demonstratedUnderstanding === false, 'demonstratedUnderstanding must be false');
  assert(concept.incorrectAnswers === 1, 'incorrectAnswers count must be 1');

  // Targeted guidance verification
  assert(
    (step1.evalResult.misconception || '').includes('Inversion'),
    'Misconception must identify numerator/denominator inversion'
  );
  assert(
    step1.evalResult.tutorMessage.toLowerCase().includes('down') ||
    step1.evalResult.tutorMessage.toLowerCase().includes('denominator'),
    'Tutor guidance must provide age-appropriate mnemonic'
  );

  // Attempting to advance while canAdvance is false must throw error
  let errorThrown = false;
  try {
    engine.advanceToNextQuestion();
  } catch {
    errorThrown = true;
  }
  assert(errorThrown, 'advanceToNextQuestion() must throw error when canAdvance is false');
});

// ---------------------------------------------------------------------------
// TEST 3: Repeated misconceptions and alternative explanations (Strategy shift & new question)
// ---------------------------------------------------------------------------
runTest('3. Repeated misconceptions and alternative explanations (shifts approach and serves new question)', () => {
  const engine = new TutorProgressionEngine({
    initialTopicId: 'adding-subtracting',
    initialQuestionId: 'diag-3',
  });

  // First error on adding-subtracting
  const step1 = engine.submitAnswer('3/8', 'diag-3');
  assert(step1.evalResult.isCorrect === false, 'Step 1 3/8 must be incorrect');
  assert(step1.conceptConsecutiveMistakes === 1, 'Mistakes on concept must be 1');

  // Second error on same concept: 2/7 + 3/7 = 5/14
  const step2 = engine.submitAnswer('5/14', 'prac-add-1');
  assert(step2.evalResult.isCorrect === false, 'Step 2 5/14 must be incorrect');
  assert(step2.conceptConsecutiveMistakes === 2, 'Mistakes on concept must be 2');

  // Verify shift in teaching approach
  assert(
    step2.teachingApproach === 'visual_interactive_shift',
    `teachingApproach must be visual_interactive_shift, got ${step2.teachingApproach}`
  );
  assert(
    step2.adaptiveAction === 'approach_shifted_new_question',
    `adaptiveAction must be approach_shifted_new_question, got ${step2.adaptiveAction}`
  );

  // Verify that a NEW question testing the same concept is dynamically served
  assert(
    step2.activeQuestionAfterTurn.id === 'prac-add-remedial-visual',
    `New remedial question must be prac-add-remedial-visual, got ${step2.activeQuestionAfterTurn.id}`
  );
  assert(
    step2.activeQuestionAfterTurn.prompt.includes('1/5 + 2/5'),
    'New question must test same concept with visual model'
  );
  assert(step2.canAdvance === false, 'canAdvance must still be false until resolved');
});

// ---------------------------------------------------------------------------
// TEST 4: Recovery after an alternative explanation
// ---------------------------------------------------------------------------
runTest('4. Recovery after an alternative explanation (resolves gap and unlocks progression)', () => {
  const engine = new TutorProgressionEngine({
    initialTopicId: 'adding-subtracting',
    initialQuestionId: 'diag-3',
  });

  // Trigger repeated mistake to cause strategy shift
  engine.submitAnswer('3/8', 'diag-3');
  engine.submitAnswer('5/14', 'prac-add-1');

  // Now student answers the new visual remedial question correctly
  const step3 = engine.submitAnswer('3/5', 'prac-add-remedial-visual');
  assert(step3.evalResult.isCorrect === true, 'Answer 3/5 must be correct');
  assert(step3.canAdvance === true, 'canAdvance must be true after correct resolution');
  assert(
    step3.adaptiveAction === 'recovery_demonstrated',
    `adaptiveAction must be recovery_demonstrated, got ${step3.adaptiveAction}`
  );

  const concept = engine.conceptStats['adding-subtracting'];
  assert(concept.hasUnresolvedMistake === false, 'hasUnresolvedMistake must be cleared (false)');
  assert(concept.demonstratedUnderstanding === true, 'demonstratedUnderstanding must be true');
  assert(concept.consecutiveMistakes === 0, 'consecutiveMistakes must reset to 0');
  assert(concept.consecutiveCorrect === 1, 'consecutiveCorrect must be 1');
});

// ---------------------------------------------------------------------------
// TEST 5: Mastery and progression (Recorded evidence required)
// ---------------------------------------------------------------------------
runTest('5. Mastery and progression (verifies recorded evidence before claiming mastery)', () => {
  const engine = new TutorProgressionEngine({
    initialTopicId: 'practical-word-problems',
    initialQuestionId: 'prac-word-1',
  });

  // Problem 1: Liam birthday money (2/5 of $40 = $16)
  const step1 = engine.submitAnswer('16', 'prac-word-1');
  assert(step1.evalResult.isCorrect === true, 'Word problem 1 must be correct');
  assert(step1.conceptConsecutiveCorrect === 1, 'consecutiveCorrect must be 1');

  // Problem 2: Pavlova sugar (1/2 * 3/4 = 3/8)
  const step2 = engine.submitAnswer('3/8', 'prac-word-2');
  assert(step2.evalResult.isCorrect === true, 'Word problem 2 must be correct');
  assert(step2.conceptConsecutiveCorrect === 2, 'consecutiveCorrect must be 2');
  assert(step2.adaptiveAction === 'challenge_escalation', 'Must escalate to challenge');
  assert(step2.activeQuestionAfterTurn.id === 'prac-mult-div-challenge', 'Must be synthesis challenge');

  // Problem 3: Feijoa juice division challenge (4 1/2 ÷ 3/4 = 6)
  const step3 = engine.submitAnswer('6', 'prac-mult-div-challenge');
  assert(step3.evalResult.isCorrect === true, 'Challenge solution 6 must be correct');
  assert(step3.conceptConsecutiveCorrect === 3, 'consecutiveCorrect must be 3');

  const concept = engine.conceptStats['practical-word-problems'];
  assert(concept.status === 'mastered', 'Concept status must be mastered');
  assert(concept.demonstratedUnderstanding === true, 'demonstratedUnderstanding must be true');
  assert(concept.score === 100, 'Score must be 100%');
  assert(concept.hasUnresolvedMistake === false, 'No unresolved mistakes');

  const { summary } = engine.leaveLessonEarly();
  assert(
    summary.conceptsMastered.includes('Practical Word Problems'),
    'Learning summary must record Practical Word Problems in conceptsMastered'
  );
});

// ---------------------------------------------------------------------------
// TEST 6: Leaving a lesson without falsely recording mastery
// ---------------------------------------------------------------------------
runTest('6. Leaving a lesson without falsely recording mastery (unearned mastery strictly prohibited)', () => {
  const engine = new TutorProgressionEngine({
    initialTopicId: 'numerators-denominators',
    initialQuestionId: 'prac-num-1',
  });

  // Student makes mistake and leaves early
  engine.submitAnswer('5 is the denominator because it is on top', 'prac-num-1');
  const { summary, records } = engine.leaveLessonEarly();

  const numConcept = records.find((r) => r.topicId === 'numerators-denominators');
  assert(numConcept !== undefined, 'Record must exist');
  assert(numConcept?.status === 'needs_practice', 'Status must be needs_practice');
  assert(numConcept?.demonstratedUnderstanding === false, 'demonstratedUnderstanding must be false');

  const topicTitle = numConcept!.topicTitle;
  assert(
    !summary.conceptsMastered.includes(topicTitle),
    'summary.conceptsMastered MUST NOT contain unmastered concept'
  );
  assert(
    summary.conceptsRequiringPractice.includes(topicTitle),
    `summary.conceptsRequiringPractice MUST contain concept with unresolved gap: ${topicTitle}`
  );
});

// ---------------------------------------------------------------------------
// TEST 7: Acceptance Scenarios A, B, C, D complete end-to-end runs
// ---------------------------------------------------------------------------
for (const scenario of ACCEPTANCE_SCENARIOS) {
  runTest(`7. Acceptance Scenario ${scenario.code}: ${scenario.name}`, () => {
    const engine = new TutorProgressionEngine({
      initialTopicId: scenario.targetTopicId,
      initialQuestionId: scenario.initialQuestionId,
      initialPhase: 'guided_practice',
    });

    for (const step of scenario.studentSteps) {
      const stepProg = engine.submitAnswer(step.studentInput, step.questionId);
      const evalResult = stepProg.evalResult;

      assert(
        evalResult.assessment === step.expectedAssertion.expectedAssessment,
        `Step ${step.step}: Expected assessment ${step.expectedAssertion.expectedAssessment}, got ${evalResult.assessment}`
      );
      assert(
        evalResult.recommendedAction === step.expectedAssertion.expectedAction,
        `Step ${step.step}: Expected action ${step.expectedAssertion.expectedAction}, got ${evalResult.recommendedAction}`
      );

      if (step.expectedAssertion.expectedCanAdvance !== undefined) {
        assert(
          stepProg.canAdvance === step.expectedAssertion.expectedCanAdvance,
          `Step ${step.step}: Expected canAdvance ${step.expectedAssertion.expectedCanAdvance}, got ${stepProg.canAdvance}`
        );
      }

      if (step.expectedAssertion.expectedAdaptiveAction) {
        assert(
          stepProg.adaptiveAction === step.expectedAssertion.expectedAdaptiveAction,
          `Step ${step.step}: Expected adaptiveAction ${step.expectedAssertion.expectedAdaptiveAction}, got ${stepProg.adaptiveAction}`
        );
      }

      if (step.expectedAssertion.expectedActiveQuestionAfterTurn) {
        assert(
          stepProg.activeQuestionAfterTurn.id === step.expectedAssertion.expectedActiveQuestionAfterTurn,
          `Step ${step.step}: Expected active question ${step.expectedAssertion.expectedActiveQuestionAfterTurn}, got ${stepProg.activeQuestionAfterTurn.id}`
        );
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const totalTests = testResults.length;
const passedTests = testResults.filter((r) => r.passed).length;
const failedTests = totalTests - passedTests;

console.log('\n------------------------------------------------------');
console.log(`Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('------------------------------------------------------\n');

if (failedTests > 0) {
  console.error(`Failed ${failedTests} tests.`);
  process.exit(1);
} else {
  console.log('All automated tests passed successfully! ✓\n');
  process.exit(0);
}
