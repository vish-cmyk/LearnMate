export interface ParsedFraction {
  num: number;
  den: number;
  value: number;
  isInteger: boolean;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function parseFraction(input: string): ParsedFraction | null {
  if (!input) return null;
  const clean = input
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'");

  // Mixed number e.g. "1 1/2" or "1 3/4"
  const mixedMatch = clean.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const n = parseInt(mixedMatch[2], 10);
    const d = parseInt(mixedMatch[3], 10);
    if (d === 0) return null;
    const totalNum = whole * d + n;
    return { num: totalNum, den: d, value: totalNum / d, isInteger: false };
  }

  // Simple fraction "3/4" or "3 / 4"
  const fracMatch = clean.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fracMatch) {
    const n = parseInt(fracMatch[1], 10);
    const d = parseInt(fracMatch[2], 10);
    if (d === 0) return null;
    return { num: n, den: d, value: n / d, isInteger: false };
  }

  // Pure integer e.g. "16"
  const intMatch = clean.match(/^(\d+)$/);
  if (intMatch) {
    const n = parseInt(intMatch[1], 10);
    return { num: n, den: 1, value: n, isInteger: true };
  }

  // Decimal e.g. "0.75"
  const decMatch = clean.match(/^(\d+\.\d+)$/);
  if (decMatch) {
    const val = parseFloat(decMatch[1]);
    return { num: Math.round(val * 1000), den: 1000, value: val, isInteger: false };
  }

  return null;
}

export function isSimplestForm(num: number, den: number): boolean {
  if (den === 0) return false;
  return gcd(num, den) === 1;
}

export interface EvaluationResult {
  assessment: 'correct' | 'incorrect' | 'partial' | 'question';
  isCorrect: boolean;
  isEquivalent: boolean;
  isSimplified: boolean;
  misconception: string | null;
  recommendedAction: 'advance' | 'reinforce' | 'simplify' | 'hint';
  tutorMessage: string;
  visualPrompt: string | null;
  pedagogicalReason: string;
  isTwoConsecutiveCorrect?: boolean;
  isRecovery?: boolean;
}

/**
 * Mathematically validates a student answer against the question specification.
 * Supports per-concept progression, repeated misconception tracking, and recovery acknowledgment.
 */
export function evaluateStudentAnswer({
  studentMessage,
  currentQuestion,
  consecutiveMistakes = 0,
  conceptConsecutiveMistakes = 0,
  conceptConsecutiveCorrect = 0,
  conceptMisconceptions = [],
  wasRecovering = false,
  studentLevel = 'standard',
}: {
  studentMessage: string;
  currentQuestion: any;
  consecutiveMistakes?: number;
  conceptConsecutiveMistakes?: number;
  conceptConsecutiveCorrect?: number;
  conceptMisconceptions?: string[];
  wasRecovering?: boolean;
  studentLevel?: string;
}): EvaluationResult {
  const cleanInput = (studentMessage || '')
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'");

  // Track consecutive mistakes strictly per concept
  const effectiveConceptMistakes = conceptConsecutiveMistakes ?? 0;

  // 1. Detect if student is asking for a hint or expressing confusion
  const isHelpRequest =
    cleanInput.includes('hint') ||
    cleanInput.includes('help') ||
    cleanInput.includes('dont know') ||
    cleanInput.includes("don't know") ||
    cleanInput.includes('not sure') ||
    cleanInput.includes("don't get") ||
    cleanInput.includes("dont get") ||
    cleanInput.includes('how do i') ||
    cleanInput.includes('how to write') ||
    cleanInput.includes('confused') ||
    cleanInput.includes('stuck') ||
    cleanInput.startsWith('what do') ||
    cleanInput === '?';

  if (isHelpRequest) {
    return {
      assessment: 'question',
      isCorrect: false,
      isEquivalent: false,
      isSimplified: false,
      misconception: null,
      recommendedAction: 'hint',
      tutorMessage: `Kia ora! No stress at all—let's break this down together step by step.\n\nTake a look at the denominator (the bottom number). That tells us how many equal pieces the whole object is divided into. What is the question asking you to count?`,
      visualPrompt: currentQuestion?.visualModel?.type ? `${currentQuestion.visualModel.type}_model` : 'bar_model',
      pedagogicalReason: 'Student asked for clarification; provided Socratic scaffolding without revealing the answer.',
    };
  }

  if (!currentQuestion) {
    return {
      assessment: 'question',
      isCorrect: false,
      isEquivalent: false,
      isSimplified: false,
      misconception: null,
      recommendedAction: 'reinforce',
      tutorMessage: `Kia ora! What question are we working on right now? Pick a problem from the practice list whenever you are ready!`,
      visualPrompt: null,
      pedagogicalReason: 'No active question found.',
    };
  }

  // 2. Handle Multiple Choice questions
  if (
    currentQuestion.questionType === 'multiple_choice' ||
    (currentQuestion.options && currentQuestion.options.length > 0)
  ) {
    const expectedLetter = String(currentQuestion.correctAnswer || '').trim().toUpperCase();
    const cleanUpper = cleanInput.toUpperCase();
    const isLetterMatch = cleanUpper === expectedLetter;

    // Check if student typed part of the option text or option value
    const matchingOption = currentQuestion.options?.find(
      (opt: any) =>
        opt.value.toUpperCase() === cleanUpper ||
        opt.label.toLowerCase().includes(cleanInput)
    );

    const isOptionCorrect = matchingOption ? matchingOption.isCorrect : isLetterMatch;

    if (isOptionCorrect) {
      const willBeTwoCorrect = conceptConsecutiveCorrect >= 1;
      return {
        assessment: 'correct',
        isCorrect: true,
        isEquivalent: true,
        isSimplified: true,
        misconception: null,
        recommendedAction: 'advance',
        isTwoConsecutiveCorrect: willBeTwoCorrect,
        isRecovery: wasRecovering,
        tutorMessage: willBeTwoCorrect
          ? `Ka pai! Spot on! 🎉 That's two in a row on this concept! You've demonstrated a really solid grasp. Ready for a more challenging question, or shall we advance to the next module?`
          : wasRecovering
          ? `Tino pai rawa atu! You applied the explanation and got it completely right! 🎉 You've resolved that gap and demonstrated solid understanding.`
          : `Ka pai! Spot on! 🎉 You chose the correct option.\n\nYou correctly identified the mathematical role of the parts. Ready for the next challenge?`,
        visualPrompt: null,
        pedagogicalReason: willBeTwoCorrect
          ? 'Demonstrated mastery of concept with two consecutive correct answers; offered challenge or progression.'
          : wasRecovering
          ? 'Student successfully recovered understanding after targeted intervention.'
          : 'Selected correct multiple choice option.',
      };
    }

    // Check if student inverted numerator and denominator in verbal explanation
    if (
      (cleanInput.includes('numerator') && cleanInput.includes('bottom')) ||
      (cleanInput.includes('denominator') && cleanInput.includes('top')) ||
      cleanInput.includes('on top')
    ) {
      return {
        assessment: 'incorrect',
        isCorrect: false,
        isEquivalent: false,
        isSimplified: false,
        misconception: 'Numerator/Denominator Inversion',
        recommendedAction: 'simplify',
        tutorMessage: `Kia ora! That is such a common place to mix things up when starting out, so don’t worry at all!\n\nHere is a handy memory trick that Kiwi teachers often use:\n• **D**enominator starts with **D** for **Down** (the bottom number).\n• **N**umerator is at the top (think **N**orth or **N**umber of pieces we have).\n\nTake another look: which number is sitting down at the bottom?`,
        visualPrompt: 'bar_model',
        pedagogicalReason: 'Diagnosed Numerator/Denominator Inversion misconception.',
      };
    }

    return {
      assessment: 'incorrect',
      isCorrect: false,
      isEquivalent: false,
      isSimplified: false,
      misconception: 'Concept Identification Error',
      recommendedAction: 'hint',
      tutorMessage: `Not quite! Remember that the denominator tells us the total number of equal parts in the whole, while the numerator counts how many of those parts we have. Take another look at the options.`,
      visualPrompt: null,
      pedagogicalReason: 'Incorrect option chosen; provided targeted conceptual clarification.',
    };
  }

  // 3. Handle Fraction / Number Inputs
  const expectedStr = String(currentQuestion.correctAnswer || '').trim();
  const parsedExpected = parseFraction(expectedStr);
  const parsedStudent = parseFraction(cleanInput);

  // Exact string match (e.g. "3/4" === "3/4")
  const isExactStr =
    cleanInput === expectedStr.toLowerCase() ||
    cleanInput.replace(/\s+/g, '') === expectedStr.toLowerCase().replace(/\s+/g, '');

  // Mathematical equivalence check
  const isMathEquivalent =
    parsedExpected && parsedStudent
      ? Math.abs(parsedStudent.value - parsedExpected.value) < 1e-7 ||
        parsedStudent.num * parsedExpected.den === parsedStudent.den * parsedExpected.num
      : isExactStr;

  // Simplification check:
  // Only require simplest form if student did NOT match exact correctAnswer AND prompt explicitly requests simplest form
  const requiresSimplest =
    !isExactStr &&
    ((currentQuestion.prompt &&
      (currentQuestion.prompt.toLowerCase().includes('simplest form') ||
        currentQuestion.prompt.toLowerCase().includes('lowest terms'))) ||
      (currentQuestion.simplifiedAnswer &&
        currentQuestion.simplifiedAnswer.toLowerCase() !== expectedStr.toLowerCase()));

  const studentIsSimplified =
    parsedStudent ? isSimplestForm(parsedStudent.num, parsedStudent.den) : true;

  // Case A: Mathematically equivalent and simplified (or simplest not strictly required)
  if (isMathEquivalent) {
    if (requiresSimplest && !studentIsSimplified) {
      // Equivalent, but unsimplified when simplest was requested
      return {
        assessment: 'partial',
        isCorrect: false,
        isEquivalent: true,
        isSimplified: false,
        misconception: 'Unsimplified Fraction',
        recommendedAction: 'reinforce',
        tutorMessage: `Great calculation! Your fraction (${parsedStudent!.num}/${parsedStudent!.den}) is mathematically equivalent to the correct amount. 🎉\n\nNow, the question asks for **simplest form**. Can you divide both the top and bottom by their common factor to reduce it? (Hint: divide both by ${gcd(parsedStudent!.num, parsedStudent!.den)})`,
        visualPrompt: null,
        pedagogicalReason: 'Mathematically equivalent answer provided, but requires simplification to lowest terms.',
      };
    }

    const willBeTwoCorrect = conceptConsecutiveCorrect >= 1;
    return {
      assessment: 'correct',
      isCorrect: true,
      isEquivalent: true,
      isSimplified: true,
      misconception: null,
      recommendedAction: 'advance',
      isTwoConsecutiveCorrect: willBeTwoCorrect,
      isRecovery: wasRecovering,
      tutorMessage: willBeTwoCorrect
        ? `Ka pai! Spot on! 🎉 ${studentMessage.trim()} is correct.\n\nThat's two consecutive correct answers on this concept! You have demonstrated solid competence. Ready for an advanced challenge or move to the next topic?`
        : wasRecovering
        ? `Tino pai rawa atu! You worked through the explanation and solved it accurately: ${studentMessage.trim()} is spot on! 🎉 You have resolved the misunderstanding and demonstrated true understanding.`
        : `Ka pai! Spot on! 🎉 ${studentMessage.trim()} is correct.\n\nNotice how you worked through the parts accurately. You're demonstrating really solid understanding here. Ready for the next challenge?`,
      visualPrompt: null,
      pedagogicalReason: willBeTwoCorrect
        ? 'Demonstrated mastery of concept with two consecutive correct answers; offered challenge or progression.'
        : wasRecovering
        ? 'Student successfully recovered understanding after targeted intervention.'
        : 'Mathematically correct answer provided.',
    };
  }

  // 4. Misconception Diagnosis for Incorrect Answers

  // A. Denominator Addition Misconception (Adding denominators: e.g. 1/4 + 2/4 = 3/8, 2/7 + 3/7 = 5/14)
  const isAdditionQuestion =
    currentQuestion.topicId === 'adding-subtracting' ||
    (currentQuestion.mathExpression && currentQuestion.mathExpression.includes('+')) ||
    (currentQuestion.prompt && currentQuestion.prompt.toLowerCase().includes('+')) ||
    (currentQuestion.prompt && currentQuestion.prompt.toLowerCase().includes('add'));

  // Check if student added denominators
  let isDenominatorAddition = false;
  if (isAdditionQuestion && parsedStudent) {
    if (
      (currentQuestion.prompt?.includes('1/4 + 2/4') && parsedStudent.den === 8) ||
      (currentQuestion.prompt?.includes('2/7 + 3/7') && parsedStudent.den === 14) ||
      (currentQuestion.prompt?.includes('1/3 + 1/6') && parsedStudent.den === 9) ||
      (cleanInput === '3/8' && currentQuestion.prompt?.includes('1/4')) ||
      (cleanInput === '5/14' && currentQuestion.prompt?.includes('2/7')) ||
      cleanInput === '2/8' ||
      (cleanInput === '2/6' && currentQuestion.prompt?.includes('1/3 + 1/3'))
    ) {
      isDenominatorAddition = true;
    }

    if (currentQuestion.commonMisconceptions) {
      for (const misc of currentQuestion.commonMisconceptions) {
        if (cleanInput === misc.pattern.toLowerCase()) {
          isDenominatorAddition = true;
        }
      }
    }
  }

  if (isDenominatorAddition) {
    // If the same misconception occurs twice on this concept
    const hadPreviousDenominatorError =
      conceptMisconceptions.some((m) => m.toLowerCase().includes('denominator addition')) ||
      effectiveConceptMistakes >= 1;

    if (hadPreviousDenominatorError) {
      return {
        assessment: 'incorrect',
        isCorrect: false,
        isEquivalent: false,
        isSimplified: false,
        misconception: 'Repeated Denominator Addition Misconception',
        recommendedAction: 'simplify',
        tutorMessage: `Hold on a moment! Notice what happened again with the denominator on the bottom: this is the second time adding denominators occurred.\n\nLet's switch approaches completely! Step away from the calculation rule and look at the **Fraction Visualizer Bar** below:\n• When a whole bar is divided into equal chunks, the denominator tells us the size of each piece.\n• When we combine pieces of the same size, the pieces do NOT magically shrink into smaller chunks!\n• Keep the bottom number untouched and only combine the numerators on top.\n\nGive it another shot with the denominator staying the same!`,
        visualPrompt: 'fraction_bar_interactive',
        pedagogicalReason: 'Same misconception occurred twice on this concept; changed teaching approach to interactive visual model.',
      };
    }

    return {
      assessment: 'incorrect',
      isCorrect: false,
      isEquivalent: false,
      isSimplified: false,
      misconception: 'Denominator Addition Misconception (adding both numerators and denominators)',
      recommendedAction: 'simplify',
      tutorMessage: `Kia ora! I can see exactly what your brain did there: you added the tops AND you added the bottoms together. Almost every maths student tries that at first!\n\nLet’s picture this: imagine a large pizza cut into equal slices. If you have some slices and your mate gives you more, do the slices magically shrink into smaller pieces? No! They stay the exact same size.\n\n**Golden Rule:** When denominators are already the same, keep the bottom number untouched and only add the tops! Try it again.`,
      visualPrompt: 'pizza_slices',
      pedagogicalReason: 'Diagnosed Denominator Addition Misconception on single turn; explained with physical pizza slice model.',
    };
  }

  // B. Numerator/Denominator Inversion (e.g. expected 3/8, student answered 8/3)
  if (
    parsedStudent &&
    parsedExpected &&
    parsedStudent.num === parsedExpected.den &&
    parsedStudent.den === parsedExpected.num
  ) {
    return {
      assessment: 'incorrect',
      isCorrect: false,
      isEquivalent: false,
      isSimplified: false,
      misconception: 'Numerator/Denominator Inversion',
      recommendedAction: 'hint',
      tutorMessage: `You're super close! You've got the right numbers, but notice their positions.\n\nRemember: the **Numerator** (top) is the number of parts we have, and the **Denominator** (bottom) is the total number of equal parts that make up the whole. Try flipping them!`,
      visualPrompt: 'bar_model',
      pedagogicalReason: 'Student inverted numerator and denominator numbers.',
    };
  }

  // C. Direct Division Error in fraction division (e.g. dividing across 6/12 instead of multiplying by reciprocal 9/8)
  if (
    currentQuestion.topicId === 'multiplying-dividing' &&
    currentQuestion.prompt?.includes('÷') &&
    (cleanInput === '6/12' || cleanInput === '1/2')
  ) {
    return {
      assessment: 'incorrect',
      isCorrect: false,
      isEquivalent: false,
      isSimplified: false,
      misconception: 'Direct Division Error (did not flip reciprocal)',
      recommendedAction: 'simplify',
      tutorMessage: `Good try! Remember the rule for dividing fractions: **Keep, Change, Flip!**\n\n1. Keep the first fraction as it is.\n2. Change the ÷ sign to × (multiplication).\n3. Flip the second fraction upside down (its reciprocal).\n\nThen multiply straight across! Try applying Keep, Change, Flip.`,
      visualPrompt: 'bar_model',
      pedagogicalReason: 'Student attempted to divide fractions directly without multiplying by reciprocal.',
    };
  }

  // D. General calculation error
  if (effectiveConceptMistakes >= 1) {
    return {
      assessment: 'incorrect',
      isCorrect: false,
      isEquivalent: false,
      isSimplified: false,
      misconception: 'Repeated Calculation Error',
      recommendedAction: 'simplify',
      tutorMessage: `You're working hard on this, and that's how real learning happens! Let's pause and look at this visually using the model below.\n\nLet's break the problem into two smaller steps: what is the denominator we need to work with first?`,
      visualPrompt: 'fraction_bar_interactive',
      pedagogicalReason: 'Repeated incorrect calculation; stepped down difficulty and opened interactive visualizer.',
    };
  }

  return {
    assessment: 'incorrect',
    isCorrect: false,
    isEquivalent: false,
    isSimplified: false,
    misconception: 'Operational Calculation Error',
    recommendedAction: 'reinforce',
    tutorMessage: `Good try! That's not quite it, but you're on the right track. Let's look at the steps: what do you notice about the numbers before we do any operation? Take another look and give it another shot.`,
    visualPrompt: null,
    pedagogicalReason: 'Incorrect answer on standard problem; prompted student to re-examine working.',
  };
}
