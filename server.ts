import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { evaluateStudentAnswer } from './src/utils/fractionEvaluator.ts';
import { TutorProgressionEngine } from './src/utils/tutorProgressionEngine.ts';
import { ACCEPTANCE_SCENARIOS } from './src/data/acceptanceScenarios.ts';
import {
  AUTHORITATIVE_QUESTION_BANK,
  getAuthoritativeQuestion,
} from './src/server/authoritativeQuestionBank.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '64kb' }));

// In-Memory Rate Limiter (Protects Gemini API quotas and server resources)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxAllowed = 60; // Max 60 requests per minute

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  record.count++;
  if (record.count > maxAllowed) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment before sending another answer.',
    });
  }

  next();
}

// Strict Input Sanitization
function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 500).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

// Only instantiate if it is a real key (not the .env.example placeholder)
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && !apiKey.includes('MY_GEMINI_API_KEY')) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction for Year 9 NZ Mathematics Tutor
const TUTOR_SYSTEM_INSTRUCTION = `You are LearnMate AI, a patient, encouraging, and expert mathematics tutor for New Zealand Year 9 secondary school students (ages 13–14).
Your mission is to guide students to truly understand and apply mathematical concepts—especially fractions—rather than simply giving them answers.

Key Pedagogical Rules:
1. NEVER reveal the final answer to an active question or problem. Guide the student with questions, hints, and mental visual models.
2. Tone: Warm, Kiwi-friendly, supportive, and age-appropriate for 13-14 year olds (e.g., occasional natural NZ context like Whittaker's chocolate blocks, sharing pavlova, rugby pitch distances, pizza nights, pocket money). Never condescending or childish.
3. Adaptive Teaching:
   - If student is correct: Warm praise, brief explanation of why their method worked, then suggest stepping up the challenge.
   - If student is incorrect: Acknowledge their effort kindly ("No worries, that's a really common trap!"). Identify the misconception (e.g. adding denominators together like 1/4 + 1/4 = 2/8) and offer a relatable visual comparison without giving the answer.
   - If student repeats a mistake: Switch explanation approach completely (e.g. from numerical rules to a visual pizza or chocolate bar model).
   - If student asks for a hint: Provide a step-by-step Socratic clue.
4. Mathematical Rigor:
   - You MUST adhere strictly to the server-verified assessment and misconception passed in the prompt.
   - Do NOT mark an incorrect answer as correct or a correct answer as incorrect.
5. Output format: You must return valid JSON with:
   - "message": What the tutor says to the student in friendly Markdown.
   - "assessment": "correct" | "incorrect" | "partial" | "question"
   - "misconception": Short description of any diagnosed misconception or null.
   - "recommendedAction": "advance" | "reinforce" | "simplify" | "hint"
   - "visualPrompt": Suggestion for a visual aid if helpful (e.g. "bar_model_quarters", "pizza_slices") or null.
`;

// Secure Adaptive Tutor Endpoint
app.post('/api/tutor/chat', rateLimiter, async (req, res) => {
  try {
    const rawMessage = req.body.studentMessage;
    const studentMessage = sanitizeInput(rawMessage);
    if (!studentMessage) {
      return res.status(400).json({
        success: false,
        error: 'Student message cannot be empty or invalid.',
      });
    }

    const questionId = req.body.questionId || (req.body.currentQuestion && req.body.currentQuestion.id);
    if (!questionId || typeof questionId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid questionId parameter.',
      });
    }

    // CRITICAL SECURITY: Authoritative Server Question Lookup
    // NEVER trust client-supplied correctAnswer or validation state.
    const authoritativeQuestion = getAuthoritativeQuestion(questionId);
    if (!authoritativeQuestion) {
      return res.status(400).json({
        success: false,
        error: `Unknown questionId: ${questionId}`,
      });
    }

    const {
      currentTopic,
      studentHistory = [],
      consecutiveMistakes = 0,
      conceptConsecutiveMistakes = 0,
      conceptConsecutiveCorrect = 0,
      conceptMisconceptions = [],
      wasRecovering = false,
      studentLevel = 'standard', // 'needs_support' | 'standard' | 'advanced'
    } = req.body;

    // 1. Authoritative Server-Side Mathematical Validation
    const groundTruth = evaluateStudentAnswer({
      studentMessage,
      currentQuestion: authoritativeQuestion,
      consecutiveMistakes: Number(consecutiveMistakes) || 0,
      conceptConsecutiveMistakes: Number(conceptConsecutiveMistakes) || 0,
      conceptConsecutiveCorrect: Number(conceptConsecutiveCorrect) || 0,
      conceptMisconceptions: Array.isArray(conceptMisconceptions) ? conceptMisconceptions : [],
      wasRecovering: Boolean(wasRecovering),
      studentLevel: studentLevel === 'needs_support' || studentLevel === 'advanced' ? studentLevel : 'standard',
    });

    // 2. Check if we can enrich the explanation using Gemini
    if (ai) {
      try {
        const prompt = `Student Level: ${studentLevel}
Current Topic: ${currentTopic || authoritativeQuestion.topicTitle}
Question Prompt: "${authoritativeQuestion.prompt}"
Math Expression: "${authoritativeQuestion.mathExpression || ''}"
Consecutive Mistakes on this concept: ${conceptConsecutiveMistakes}
Student's latest message / answer: "${studentMessage}"

GROUND TRUTH MATHEMATICAL VALIDATION (MANDATORY TO FOLLOW):
- Verified Assessment: ${groundTruth.assessment} (isCorrect: ${groundTruth.isCorrect}, isEquivalent: ${groundTruth.isEquivalent}, isSimplified: ${groundTruth.isSimplified})
- Diagnosed Misconception: ${groundTruth.misconception || 'None'}
- Required Action: ${groundTruth.recommendedAction}
- Reason: ${groundTruth.pedagogicalReason}

Recent conversation summary:
${Array.isArray(studentHistory) ? studentHistory.slice(-4).map((h: any) => `${h.sender || h.role}: ${h.text}`).join('\n') : ''}

Instruction:
Provide a warm, supportive pedagogical response consistent with the ground truth evaluation above.
Return valid JSON:
{"message": "...", "assessment": "${groundTruth.assessment}", "misconception": ${groundTruth.misconception ? JSON.stringify(groundTruth.misconception) : 'null'}, "recommendedAction": "${groundTruth.recommendedAction}", "visualPrompt": ${groundTruth.visualPrompt ? JSON.stringify(groundTruth.visualPrompt) : 'null'}}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out')), 5000)
        );

        const apiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
          },
        });

        const response: any = await Promise.race([apiPromise, timeoutPromise]);
        const text = response.text;

        if (text) {
          const parsed = JSON.parse(text);
          // Enforce ground truth invariants regardless of Gemini output
          parsed.assessment = groundTruth.assessment;
          parsed.isCorrect = groundTruth.isCorrect;
          parsed.isEquivalent = groundTruth.isEquivalent;
          parsed.isSimplified = groundTruth.isSimplified;
          parsed.recommendedAction = groundTruth.recommendedAction;
          parsed.isTwoConsecutiveCorrect = groundTruth.isTwoConsecutiveCorrect;
          parsed.isRecovery = groundTruth.isRecovery;
          if (groundTruth.misconception) parsed.misconception = groundTruth.misconception;
          if (groundTruth.visualPrompt) parsed.visualPrompt = groundTruth.visualPrompt;

          return res.json({
            success: true,
            data: parsed,
            source: 'gemini_with_server_validation',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed or rate limited, falling back to verified pedagogical rules engine:', geminiError);
      }
    }

    // 3. Deterministic Pedagogical Response (Ground Truth)
    return res.json({
      success: true,
      data: {
        message: groundTruth.tutorMessage,
        assessment: groundTruth.assessment,
        isCorrect: groundTruth.isCorrect,
        isEquivalent: groundTruth.isEquivalent,
        isSimplified: groundTruth.isSimplified,
        misconception: groundTruth.misconception,
        recommendedAction: groundTruth.recommendedAction,
        visualPrompt: groundTruth.visualPrompt,
        pedagogicalReason: groundTruth.pedagogicalReason,
        isTwoConsecutiveCorrect: groundTruth.isTwoConsecutiveCorrect,
        isRecovery: groundTruth.isRecovery,
      },
      source: 'pedagogical_engine',
    });
  } catch (error) {
    console.error('Error in tutor chat endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process tutor response.',
    });
  }
});

// Automated Acceptance Test Runner Endpoint: Tests the Complete Progression Logic
app.post('/api/test/scenarios/run', (req, res) => {
  try {
    const results = ACCEPTANCE_SCENARIOS.map((scenario) => {
      // 1. Initialize genuine progression engine state machine
      const engine = new TutorProgressionEngine({
        initialTopicId: scenario.targetTopicId,
        initialQuestionId: scenario.initialQuestionId,
        initialPhase: 'guided_practice',
      });

      const stepResults = scenario.studentSteps.map((step) => {
        // Execute answer through progression engine
        const stepProg = engine.submitAnswer(step.studentInput, step.questionId);
        const evalResult = stepProg.evalResult;

        // Verify mathematical evaluation assertions
        const matchesAssessment = evalResult.assessment === step.expectedAssertion.expectedAssessment;
        const matchesAction = evalResult.recommendedAction === step.expectedAssertion.expectedAction;
        const matchesMisconception = step.expectedAssertion.expectedMisconceptionSnippet
          ? (evalResult.misconception || '').toLowerCase().includes(step.expectedAssertion.expectedMisconceptionSnippet.toLowerCase())
          : true;
        const matchesVisual = step.expectedAssertion.requiresVisualPrompt
          ? Boolean(evalResult.visualPrompt || stepProg.teachingApproach === 'visual_interactive_shift')
          : true;

        // Verify progression state machine assertions (retries, question shifts, challenge escalations)
        const matchesCanAdvance = step.expectedAssertion.expectedCanAdvance !== undefined
          ? stepProg.canAdvance === step.expectedAssertion.expectedCanAdvance
          : true;
        const matchesAdaptiveAction = step.expectedAssertion.expectedAdaptiveAction
          ? stepProg.adaptiveAction === step.expectedAssertion.expectedAdaptiveAction
          : true;
        const matchesActiveQuestion = step.expectedAssertion.expectedActiveQuestionAfterTurn
          ? stepProg.activeQuestionAfterTurn.id === step.expectedAssertion.expectedActiveQuestionAfterTurn
          : true;

        const passed =
          matchesAssessment &&
          matchesAction &&
          matchesMisconception &&
          matchesVisual &&
          matchesCanAdvance &&
          matchesAdaptiveAction &&
          matchesActiveQuestion;

        return {
          step: step.step,
          questionId: step.questionId,
          studentInput: step.studentInput,
          passed,
          actualAssessment: evalResult.assessment,
          actualAction: evalResult.recommendedAction,
          actualMisconception: evalResult.misconception,
          actualVisualPrompt: evalResult.visualPrompt,
          canAdvance: stepProg.canAdvance,
          adaptiveAction: stepProg.adaptiveAction,
          activeQuestionAfterTurn: stepProg.activeQuestionAfterTurn.id,
          tutorMessage: evalResult.tutorMessage,
          pedagogicalReason: `Engine Action: ${stepProg.adaptiveAction} | CanAdvance: ${stepProg.canAdvance} | NextQ: ${stepProg.activeQuestionAfterTurn.id} | Consecutive Correct: ${stepProg.conceptConsecutiveCorrect}`,
        };
      });

      // Verification of Requirement 1: Test leaveLessonEarly logic for Scenario B (unresolved error) vs Scenario A/D (mastery)
      let earlyExitValidated = true;
      if (scenario.code === 'B') {
        const testEngine = new TutorProgressionEngine({
          initialTopicId: scenario.targetTopicId,
          initialQuestionId: scenario.initialQuestionId,
        });
        testEngine.submitAnswer('5 is the denominator because it is on top'); // trigger error
        const { summary, records } = testEngine.leaveLessonEarly();
        // Must NOT mark as mastered! Must be needs_practice.
        const topicRecord = records.find((r) => r.topicId === scenario.targetTopicId);
        earlyExitValidated = Boolean(topicRecord?.status === 'needs_practice' && !summary.conceptsMastered.includes(topicRecord.topicTitle));
      }

      const allStepsPassed = stepResults.every((s) => s.passed) && earlyExitValidated;

      return {
        scenarioId: scenario.id,
        code: scenario.code,
        name: scenario.name,
        passed: allStepsPassed,
        earlyExitValidated,
        steps: stepResults,
      };
    });

    const allPassed = results.every((r) => r.passed);

    res.json({
      success: true,
      allPassed,
      totalScenarios: results.length,
      passedCount: results.filter((r) => r.passed).length,
      scenarios: results,
    });
  } catch (error) {
    console.error('Error running acceptance tests:', error);
    res.status(500).json({ success: false, error: 'Failed to run tests' });
  }
});

// Curriculum metadata endpoint
app.get('/api/curriculum', (req, res) => {
  res.json({
    country: 'New Zealand',
    schoolSystem: 'Secondary School (Years 9–13 / Ages 13–18)',
    activeLesson: {
      year: 9,
      subject: 'Mathematics',
      topic: 'Fractions',
      status: 'active',
      modules: [
        'Understanding Numerators and Denominators',
        'Equivalent Fractions',
        'Simplifying Fractions',
        'Comparing Fractions',
        'Adding and Subtracting Fractions',
        'Multiplying and Dividing Fractions',
        'Practical Word Problems',
      ],
    },
    plannedCurriculum: [
      { year: 9, subjects: ['Mathematics', 'English', 'Science'], status: 'partially_active' },
      { year: 10, subjects: ['Mathematics', 'English', 'Science'], status: 'planned' },
      { year: 11, subjects: ['Mathematics (NCEA L1)', 'English (NCEA L1)', 'Science (NCEA L1)'], status: 'planned' },
      { year: 12, subjects: ['Mathematics (NCEA L2)', 'English (NCEA L2)', 'Science / Biology / Chemistry / Physics (NCEA L2)'], status: 'planned' },
      { year: 13, subjects: ['Calculus / Statistics (NCEA L3)', 'English (NCEA L3)', 'Sciences (NCEA L3)'], status: 'planned' },
    ],
  });
});

// Setup Vite in dev mode or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`LearnMate AI server listening on http://localhost:${port}`);
  });
}

startServer();
