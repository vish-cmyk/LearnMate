import { AuthoritativeFractionQuestion, FractionQuestion } from '../types';

/**
 * Convert a server-authoritative question into its browser-safe representation.
 * Never expose answer keys, simplification keys, or misconception answer patterns.
 */
export function toClientQuestion(question: AuthoritativeFractionQuestion): FractionQuestion {
  const {
    correctAnswer,
    unsimplifiedAnswer,
    simplifiedAnswer,
    commonMisconceptions,
    options,
    ...publicQuestion
  } = question;

  return {
    ...publicQuestion,
    options: options?.map(({ label, value }) => ({ label, value })),
  };
}
