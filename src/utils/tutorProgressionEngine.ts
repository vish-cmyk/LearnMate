import {
  AuthoritativeFractionQuestion,
  ConceptMasteryRecord,
  StudentSessionSummary,
} from '../types';
import { FRACTION_TOPICS } from '../data/fractionsCurriculum';
import {
  AUTHORITATIVE_QUESTION_BANK,
  getAuthoritativeQuestion,
} from '../server/authoritativeQuestionBank';
import { evaluateStudentAnswer, EvaluationResult } from './fractionEvaluator';

export interface ProgressionEngineStepResult {
  stepNumber: number;
  questionId: string;
  studentInput: string;
  evalResult: EvaluationResult;
  conceptId: string;
  conceptConsecutiveCorrect: number;
  conceptConsecutiveMistakes: number;
  hasUnresolvedMistake: boolean;
  canAdvance: boolean;
  isRetryRequired: boolean;
  teachingApproach: 'standard' | 'visual_interactive_shift';
  adaptiveAction:
    | 'standard_correct'
    | 'retry_required'
    | 'approach_shifted_new_question'
    | 'recovery_demonstrated'
    | 'challenge_escalation'
    | 'topic_advanced';
  activeQuestionAfterTurn: AuthoritativeFractionQuestion;
}

export class TutorProgressionEngine {
  public currentPhase: 'diagnostic' | 'guided_practice' | 'independent_assessment';
  public currentTopicId: string;
  public activeQuestion: AuthoritativeFractionQuestion;
  public canAdvance: boolean;
  public isRetryRequired: boolean;
  public teachingApproach: 'standard' | 'visual_interactive_shift';
  public conceptStats: Record<string, ConceptMasteryRecord>;
  public totalAttempts: number;
  public correctCount: number;
  public incorrectCount: number;
  public startTime: number;
  public completedQuestionIds: Set<string>;
  public stepHistory: ProgressionEngineStepResult[];

  constructor(options?: {
    initialPhase?: 'diagnostic' | 'guided_practice' | 'independent_assessment';
    initialTopicId?: string;
    initialQuestionId?: string;
  }) {
    this.currentPhase = options?.initialPhase || 'guided_practice';
    this.currentTopicId = options?.initialTopicId || 'numerators-denominators';

    // Find initial question in authoritative registry
    const targetQ = options?.initialQuestionId
      ? getAuthoritativeQuestion(options.initialQuestionId)
      : null;

    if (targetQ) {
      this.activeQuestion = targetQ;
      this.currentTopicId = targetQ.topicId;
    } else {
      const firstQ = AUTHORITATIVE_QUESTION_BANK.find(
        (q) => q.topicId === this.currentTopicId && q.stage === this.currentPhase
      );
      this.activeQuestion = firstQ || AUTHORITATIVE_QUESTION_BANK[0];
    }

    this.canAdvance = false;
    this.isRetryRequired = false;
    this.teachingApproach = 'standard';
    this.totalAttempts = 0;
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.startTime = Date.now();
    this.completedQuestionIds = new Set<string>();
    this.stepHistory = [];

    // Initialize per-concept records
    this.conceptStats = {};
    for (const topic of FRACTION_TOPICS) {
      this.conceptStats[topic.id] = {
        topicId: topic.id,
        topicTitle: topic.title,
        status: 'not_started',
        score: 0,
        attempts: 0,
        successes: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        consecutiveCorrect: 0,
        consecutiveMistakes: 0,
        demonstratedUnderstanding: false,
        currentDifficultyLevel: 'standard',
        hasUnresolvedMistake: false,
        misconceptionsEncountered: [],
      };
    }
  }

  /**
   * Process a student's answer according to NZ pedagogical & adaptive rules.
   */
  public submitAnswer(studentInput: string, targetQuestionId?: string): ProgressionEngineStepResult {
    // If a specific question is targeted for this turn, look up in authoritative bank
    if (targetQuestionId) {
      const targetQ = getAuthoritativeQuestion(targetQuestionId);
      if (targetQ) {
        this.activeQuestion = targetQ;
        this.currentTopicId = targetQ.topicId;
      }
    }

    this.totalAttempts++;
    const currentConcept = this.conceptStats[this.activeQuestion.topicId];

    // 1. Evaluate with authoritative mathematical validation engine
    const evalResult = evaluateStudentAnswer({
      studentMessage: studentInput,
      currentQuestion: this.activeQuestion,
      consecutiveMistakes: currentConcept.consecutiveMistakes,
      conceptConsecutiveMistakes: currentConcept.consecutiveMistakes,
      conceptConsecutiveCorrect: currentConcept.consecutiveCorrect,
      conceptMisconceptions: currentConcept.misconceptionsEncountered,
      wasRecovering: currentConcept.hasUnresolvedMistake,
    });

    let adaptiveAction: ProgressionEngineStepResult['adaptiveAction'] = 'standard_correct';

    if (evalResult.isCorrect) {
      this.correctCount++;
      currentConcept.attempts++;
      currentConcept.successes++;
      currentConcept.correctAnswers++;
      currentConcept.consecutiveCorrect++;
      currentConcept.consecutiveMistakes = 0;
      this.completedQuestionIds.add(this.activeQuestion.id);

      // Requirement 1 & 3: Correct answer unlocks progression
      this.canAdvance = true;
      this.isRetryRequired = false;

      // Requirement 3: Check if student resolved a previous mistake
      if (currentConcept.hasUnresolvedMistake) {
        currentConcept.hasUnresolvedMistake = false;
        currentConcept.demonstratedUnderstanding = true;
        adaptiveAction = 'recovery_demonstrated';
      }

      // Requirement 2: After two consecutive correct answers on a concept,
      // actual adaptive question selection: offer harder question or move forward!
      if (currentConcept.consecutiveCorrect >= 2) {
        currentConcept.demonstratedUnderstanding = true;
        // Look for an unattempted challenge question for this concept in authoritative bank
        const challengeQ = AUTHORITATIVE_QUESTION_BANK.find(
          (q) =>
            q.topicId === this.currentTopicId &&
            q.difficulty === 'challenge' &&
            !this.completedQuestionIds.has(q.id) &&
            q.id !== this.activeQuestion.id
        );

        if (challengeQ) {
          // Adaptively route to harder question
          this.activeQuestion = challengeQ;
          currentConcept.currentDifficultyLevel = 'challenge';
          adaptiveAction = 'challenge_escalation';
        } else {
          // No more challenge questions on this topic; advance topic or mark mastered
          const score = Math.round((currentConcept.successes / currentConcept.attempts) * 100);
          if (score >= 80) {
            currentConcept.status = 'mastered';
          } else {
            currentConcept.status = 'understood';
          }
          adaptiveAction = 'topic_advanced';
        }
      } else {
        const score = Math.round((currentConcept.successes / currentConcept.attempts) * 100);
        if (score >= 60) {
          currentConcept.status = 'understood';
        }
      }
    } else if (evalResult.assessment === 'question') {
      // Clarification or hint request: does not increment mistakes or block progression
      this.canAdvance = false;
      this.isRetryRequired = true;
      adaptiveAction = 'retry_required';
    } else {
      // Incorrect answer
      this.incorrectCount++;
      currentConcept.attempts++;
      currentConcept.incorrectAnswers++;
      currentConcept.consecutiveMistakes++;
      currentConcept.consecutiveCorrect = 0;
      currentConcept.hasUnresolvedMistake = true;
      currentConcept.demonstratedUnderstanding = false;
      currentConcept.status = 'needs_practice';

      if (evalResult.misconception) {
        currentConcept.misconceptionsEncountered.push(evalResult.misconception);
      }

      // Requirement 1: Cannot advance until student retries and demonstrates understanding!
      this.canAdvance = false;
      this.isRetryRequired = true;

      // Requirement 4: If the same misconception occurs twice on the same concept
      // OR consecutive mistakes on this concept >= 2:
      // Change explanation and visual teaching method, then provide a NEW question testing the same concept!
      const misconceptionCount = evalResult.misconception
        ? currentConcept.misconceptionsEncountered.filter((m) => m === evalResult.misconception).length
        : 0;

      if (misconceptionCount >= 2 || currentConcept.consecutiveMistakes >= 2) {
        this.teachingApproach = 'visual_interactive_shift';

        // Adaptively find a new question for the same concept (remedial/intro/scaffolded)
        const newRemedialQ =
          AUTHORITATIVE_QUESTION_BANK.find(
            (q) =>
              q.topicId === this.currentTopicId &&
              q.id !== this.activeQuestion.id &&
              !this.completedQuestionIds.has(q.id) &&
              (q.id.includes('remedial') || q.id.includes('whittakers'))
          ) ||
          AUTHORITATIVE_QUESTION_BANK.find(
            (q) =>
              q.topicId === this.currentTopicId &&
              q.id !== this.activeQuestion.id &&
              !this.completedQuestionIds.has(q.id) &&
              q.stage === 'guided_practice' &&
              q.difficulty === 'intro'
          );

        if (newRemedialQ) {
          this.activeQuestion = newRemedialQ;
          currentConcept.currentDifficultyLevel = 'intro';
        }

        adaptiveAction = 'approach_shifted_new_question';
      } else {
        adaptiveAction = 'retry_required';
      }
    }

    currentConcept.score = Math.round((currentConcept.successes / Math.max(1, currentConcept.attempts)) * 100);

    const stepResult: ProgressionEngineStepResult = {
      stepNumber: this.stepHistory.length + 1,
      questionId: this.activeQuestion.id,
      studentInput,
      evalResult,
      conceptId: this.currentTopicId,
      conceptConsecutiveCorrect: currentConcept.consecutiveCorrect,
      conceptConsecutiveMistakes: currentConcept.consecutiveMistakes,
      hasUnresolvedMistake: currentConcept.hasUnresolvedMistake,
      canAdvance: this.canAdvance,
      isRetryRequired: this.isRetryRequired,
      teachingApproach: this.teachingApproach,
      adaptiveAction,
      activeQuestionAfterTurn: this.activeQuestion,
    };

    this.stepHistory.push(stepResult);
    return stepResult;
  }

  /**
   * Reset the input state to allow retry on the current question.
   */
  public retryCurrentQuestion(): void {
    this.isRetryRequired = false;
  }

  /**
   * Advance to the next question when allowed by adaptive mastery.
   */
  public advanceToNextQuestion(): boolean {
    if (!this.canAdvance) {
      throw new Error(
        'Adaptive Progression Error: Student cannot advance after an incorrect answer until understanding is demonstrated.'
      );
    }

    // Find next uncompleted question for current topic or advance topic
    const nextQ = AUTHORITATIVE_QUESTION_BANK.find(
      (q) =>
        q.topicId === this.currentTopicId &&
        q.stage === this.currentPhase &&
        !this.completedQuestionIds.has(q.id)
    );

    if (nextQ) {
      this.activeQuestion = nextQ;
      this.canAdvance = false;
      return true;
    }

    // Advance to next topic in curriculum
    const currentIdx = FRACTION_TOPICS.findIndex((t) => t.id === this.currentTopicId);
    if (currentIdx >= 0 && currentIdx < FRACTION_TOPICS.length - 1) {
      const nextTopic = FRACTION_TOPICS[currentIdx + 1];
      this.currentTopicId = nextTopic.id;
      const firstQOfNext = AUTHORITATIVE_QUESTION_BANK.find(
        (q) => q.topicId === nextTopic.id && q.stage === 'guided_practice'
      );
      this.activeQuestion = firstQOfNext || AUTHORITATIVE_QUESTION_BANK[0];
      this.canAdvance = false;
      return true;
    }

    return false;
  }

  /**
   * Requirement 1: Leave lesson early without falsely marking concepts as mastered.
   */
  public leaveLessonEarly(): { summary: StudentSessionSummary; records: ConceptMasteryRecord[] } {
    const recordsList = Object.values(this.conceptStats).map((rec) => {
      // If concept had unresolved errors or incomplete consecutive correct, mark as needs_practice
      if (rec.hasUnresolvedMistake || (rec.attempts > 0 && rec.consecutiveCorrect < 2)) {
        return {
          ...rec,
          status: 'needs_practice' as const,
          demonstratedUnderstanding: false,
          notes: 'Student exited lesson early without demonstrating mastery on this concept.',
        };
      }
      return rec;
    });

    // Mastered concepts MUST have recorded evidence: >=2 consecutive correct, >=80% score, 0 unresolved mistakes
    const masteredList = recordsList
      .filter((r) => r.status === 'mastered' && !r.hasUnresolvedMistake && r.consecutiveCorrect >= 2)
      .map((r) => r.topicTitle);

    const needsPracticeList = recordsList
      .filter((r) => r.status === 'needs_practice' || r.hasUnresolvedMistake)
      .map((r) => r.topicTitle);

    const summary: StudentSessionSummary = {
      sessionDurationSeconds: Math.round((Date.now() - this.startTime) / 1000),
      totalAttempted: this.totalAttempts,
      correctAnswers: this.correctCount,
      incorrectAnswers: this.incorrectCount,
      accuracyPercentage: this.totalAttempts > 0 ? Math.round((this.correctCount / this.totalAttempts) * 100) : 0,
      conceptsMastered: masteredList,
      conceptsRequiringPractice: needsPracticeList,
      addressedMisconceptions: Array.from(
        new Set(recordsList.flatMap((r) => r.misconceptionsEncountered))
      ),
      recommendedNextSteps: [
        'Complete remaining guided practice problems to build fluency.',
        'Review visual models for concepts requiring practice before next session.',
      ],
      assessmentCompleted: false,
    };

    return { summary, records: recordsList };
  }
}
