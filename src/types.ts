export type YearLevel = 9 | 10 | 11 | 12 | 13;

export type SubjectId = 'mathematics' | 'english' | 'science';

export interface SubjectOption {
  id: SubjectId;
  name: string;
  iconName: string;
  description: string;
}

export interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  year: YearLevel;
  subject: SubjectId;
  status: 'active' | 'planned';
  nzCurriculumStrand?: string;
}

export interface FractionOption {
  label: string;
  value: string;
}

export interface AuthoritativeFractionOption extends FractionOption {
  isCorrect: boolean;
  feedback?: string;
}

export interface FractionQuestion {
  id: string;
  topicId: string;
  topicTitle: string;
  stage: 'diagnostic' | 'guided_practice' | 'independent_assessment';
  difficulty: 'intro' | 'standard' | 'challenge';
  prompt: string;
  contextStory?: string;
  mathExpression?: string;
  questionType: 'fraction_input' | 'multiple_choice' | 'step_by_step';
  options?: FractionOption[];
  hints: string[];
  explanation?: string;
  visualModel?: {
    type: 'bar' | 'circle' | 'comparison';
    numerator: number;
    denominator: number;
    secondNumerator?: number;
    secondDenominator?: number;
    unitLabel?: string;
  };
}

export interface AuthoritativeFractionQuestion extends FractionQuestion {
  correctAnswer: string; // e.g. "3/4" or "B"
  unsimplifiedAnswer?: string;
  simplifiedAnswer?: string;
  options?: AuthoritativeFractionOption[];
  explanation: string;
  commonMisconceptions?: {
    pattern: string;
    label: string;
    tutorIntervention: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
  timestamp: string;
  mathHighlight?: string;
  assessment?: 'correct' | 'incorrect' | 'partial' | 'question';
  misconceptionDiagnosed?: string | null;
  recommendedAction?: 'advance' | 'reinforce' | 'simplify' | 'hint';
  visualPrompt?: string | null;
}

export interface ConceptMasteryRecord {
  topicId: string;
  topicTitle: string;
  status: 'not_started' | 'needs_practice' | 'understood' | 'mastered';
  score: number; // percentage
  attempts: number; // Questions attempted
  successes: number; // Correct answers count
  correctAnswers: number; // Correct answers
  incorrectAnswers: number; // Incorrect answers
  consecutiveMistakes: number; // Consecutive mistakes on this concept
  consecutiveCorrect: number; // Consecutive correct answers on this concept
  demonstratedUnderstanding: boolean; // Demonstrated understanding flag
  currentDifficultyLevel: 'intro' | 'standard' | 'challenge'; // Current difficulty level
  hasUnresolvedMistake: boolean;
  misconceptionsEncountered: string[];
  notes?: string;
}

export interface StudentSessionSummary {
  sessionDurationSeconds: number;
  totalAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  conceptsMastered: string[];
  conceptsRequiringPractice: string[];
  addressedMisconceptions: string[];
  recommendedNextSteps: string[];
  assessmentCompleted: boolean;
}

export type AcceptanceScenarioType = 
  | 'A_NEEDS_CHALLENGE' 
  | 'B_STRUGGLING' 
  | 'C_REPEATED_CALC_ERROR' 
  | 'D_TOPIC_MASTERY';
